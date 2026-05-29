import mongoose, { Schema, HydratedDocument } from "mongoose";
import Joi from "joi";
import { ICartItem, ICartDoc } from "../interfaces/cart.js";

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
    unit_price: { type: Number, required: true },
    discount_price: { type: Number, default: 0 }
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema<ICartDoc>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: { type: String },
    status: {
      type: String,
      enum: ["active", "checked_out", "expired"],
      default: "active",
    },
    items: { type : [cartItemSchema], default : [] },
  },
  { timestamps: true },
);

export const validateCart = (data: Record<string, any>) => {
  const schema = Joi.object({
  productId: Joi.string().required()
});

return schema.validate(data);
};
export const validateUpdateQueryCart = (data: Record<string, any>) => {
  const schema = Joi.object({
  increment: Joi.boolean().required()
});

return schema.validate(data);
};


export const Cart = mongoose.model<ICartDoc>("Cart", cartSchema);

