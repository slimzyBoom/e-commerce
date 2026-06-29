import mongoose, { Schema, Types } from "mongoose";
import Joi from "joi";

interface Product {
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  discountPrice: number;
  category: string;
  images: Types.ObjectId[];
  unit: number;
  avgRating: number;
  reviewCount: number;
  // attributes: Map<string, any>;
}
export interface ProductDto {
  name: string;
  description: string;
  category: string;
  unit: number;
  price: number;
}

const ProductSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    discountPrice: { type: Number, default: null },
    category: { type: String, required: true },
    images: [{ type: Schema.Types.ObjectId, ref: "Image", required: true }],
    unit: { type: Number, required: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // attributes: { type: Map, of: Schema.Types.Mixed }
  },
  { timestamps: true },
);

ProductSchema.index(
  {
    category: 1,
    name: "text",
    description: "text"
  },
  { name: "ProductCatalogIndex" }
);
// ProductSchema.index({ "attributes.$**" : 1 })

export const validateCreateProduct = (product: Record<string, any>) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().required(),
    // images: Joi.array().items(Joi.string().uri()).required(),
    unit: Joi.number().integer().min(0).required(),
  });
  return schema.validate(product);
};

export const validateProductFilter = (data: Record<string, any>) => {
  const schema = Joi.object({
  category: Joi.string().trim(),

  inStock: Joi.boolean().messages({
    "boolean.base": "inStock must be true or false",
  }),

  sort: Joi.string()
    .valid("price", "rating", "createdAt", "-price", "-rating", "-createdAt")
    .messages({
      "any.only":
        "sort must be one of: price, rating, createdAt, -price, -rating, -createdAt",
    }),

  search: Joi.string().trim(),
});

return schema.validate(data)
}

export const Product = mongoose.model<Product>("Product", ProductSchema);
