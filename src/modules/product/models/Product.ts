import mongoose, { Schema } from "mongoose";
import Joi from "joi";

interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  // images: string[];
  unit: number;
  avgRating: number;
  reviewCount: number;
}
export interface ProductDto {
  name: string;
  description: string;
  category: string;
  unit: number;
  price: number;
}

const ProductSchema = new Schema<Product>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  // images: [{ type: String, required: true }],
  unit: { type: Number, required: true },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
},
{ timestamps: true });

export const validateProduct = (product: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().required(),
    // images: Joi.array().items(Joi.string().uri()).required(),
    unit: Joi.number().integer().min(0).required()
  });
  return schema.validate(product);
};

export const Product = mongoose.model<Product>("Product", ProductSchema);
