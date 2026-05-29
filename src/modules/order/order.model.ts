import mongoose, { Schema } from "mongoose";
import {
  IOrder,
  IOrderItem,
  OrderStatus,
  PaymentStatus,
} from "./order.interface.js";

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    unit_price: { type: Number, required: true },
    discount_price: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    sub_total: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order_number: { type: String, required: true },
    sub_total: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    shipping_fee: { type: Number, required: true },
    tax_fee: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    payment_reference: { type: String },
    payment_provider: { type: String },
    paid_at: { type: Date },
    shipping_info: {
      full_name: { type: String, required: true },
      email: { type: String, required: true },
      phone_number: { type: String, required: true },
      street_address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip_code: { type: Number, required: true },
    },
    items: { type: [orderItemSchema], required: true },
  },
  { timestamps: true },
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
