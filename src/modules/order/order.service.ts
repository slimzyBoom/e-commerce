import { Cart } from "modules/cart/models/Cart.js";
import { CartStatus } from "modules/cart/interfaces/cart.js";
import {
  calculateFees,
  validateCheckoutCart,
  convertNairaToKobo,
} from "./order.util.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose";
import { ShippingInfo, OrderStatus, PaymentStatus } from "./order.interface.js";
import { Order, validateShippingInfo } from "./order.model.js";
import { randomUUID } from "crypto";
import axios from "axios";
import mongoose from "mongoose";

export const previewCartService = async (userId: Types.ObjectId) => {
  const cart = await Cart.findOne({ userId, status: CartStatus.Active }).lean();
  if (!cart) {
    throw new AppError("Cart not found", HttpStatus.NotFound);
  }
  const { items, sub_total } = await validateCheckoutCart(cart);
  const { shipping_fee, tax_fee } = calculateFees(sub_total);
  const total_amount = sub_total + shipping_fee + tax_fee;
  return {
    total_amount,
    items,
    sub_total,
    shipping_fee,
    tax_fee,
    cartId: cart._id,
  };
};

export const initializeCheckoutService = async (
  userId: Types.ObjectId,
  shippingInfo: ShippingInfo,
) => {
  const { error, value: shippingInfoValid } =
    validateShippingInfo(shippingInfo);
  if (error) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      error.details[0].message,
    );
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const orderDetails = await previewCartService(userId); // Valid cart items with it's details
  console.log(orderDetails);
  const [order] = await Order.create([
    {
    user_id: userId,
    cart_id: orderDetails.cartId,
    order_number: `ORD-${randomUUID()}`,
    sub_total: orderDetails.sub_total,
    total_amount: orderDetails.total_amount,
    shipping_fee: orderDetails.shipping_fee,
    tax_fee: orderDetails.tax_fee,
    shipping_info: shippingInfoValid,
    items: orderDetails.items,
  }
  ], { session });

  const paystackPrivateKey = process.env.PAYSTACK_PRIVATE_KEY as string;
  const paystackUrl = "https://api.paystack.co/transaction/initialize";
  const response = await axios.post(
    paystackUrl,
    {
      email: shippingInfoValid.email,
      amount: convertNairaToKobo(orderDetails.total_amount),
      metadata: {
        order_id: order._id.toString(),
        order_number: order.order_number,
        user_id: userId.toString(),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${paystackPrivateKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.data.status) {
    throw new AppError(
      "Payment initialization failed",
      HttpStatus.ServerError,
      response.data.message,
    );
  }

  const { authorization_url, reference } = response.data.data;

  order.payment_reference = reference;
  order.payment_provider = "paystack";
  await order.save({ session });

  await session.commitTransaction()
  return { authorization_url };
  }catch(error){
    await session.abortTransaction();

    if(error instanceof AppError) throw error;

    throw new AppError(
      "Checkout initialization failed",
      HttpStatus.ServerError,
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }finally {
    await session.endSession();
  }

  
};

export const verifyCheckoutService = async (userId: Types.ObjectId, reference: string) => {
  const order = await Order.findOne({ user_id: userId, payment_reference: reference });
  if (!order) {
    throw new AppError("Order not found", HttpStatus.NotFound);
  }
  const paystackPrivateKey = process.env.PAYSTACK_PRIVATE_KEY as string;
  const response = await axios.get(
    "https://api.paystack.co/transaction/verify",
    {
      params: { reference },
      headers: {
        Authorization: `Bearer ${paystackPrivateKey}`,
      }
    }
  );
  
  if(!response.data.status){
    throw new AppError("Payment verification failed", HttpStatus.ServerError, response.data.message);
  }
  if(response.data.data.status !== "success" || response.data.data.amount !== convertNairaToKobo(order.total_amount)){
    throw new AppError("Payment verification failed", HttpStatus.ServerError, "Payment status or amount mismatch");
  }
  order.payment_status = PaymentStatus.PAID;
  order.status = OrderStatus.PROCESSING;
  order.paid_at = response.data.data.paid_at;
  await order.save();
  const cart = await Cart.findByIdAndUpdate(order.cart_id, { $set: { status: CartStatus.CheckedOut } }, { new: true });
  if (!cart) {
    throw new AppError("Cart not found", HttpStatus.NotFound);
  }

return { message: "Payment verified and order updated successfully" };
};
