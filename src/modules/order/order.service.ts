import { Cart } from "modules/cart/models/Cart.js"
import { calculateFees, validateCheckoutCart } from "./order.util.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose";

export const previewCartService = async (userId: Types.ObjectId) => {
    const cart = await Cart.findOne({ userId, status: "active" }).lean();
    if(!cart){
        throw new AppError("Cart not found", HttpStatus.NotFound)
    }
    const {items, sub_total } = await validateCheckoutCart(cart);
    const { shipping_fee, tax_fee } = calculateFees(sub_total);
    const total_amount = sub_total + shipping_fee + tax_fee;
    return {
        total_amount,
        items,
        sub_total,
        shipping_fee,
        tax_fee
    }
}

export const orderCheckoutService = async (userId: Types.ObjectId) => {
    const orderDetails = await previewCartService(userId);
}