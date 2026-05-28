import mongoose, { Schema, Types } from "mongoose";
import Joi from "joi";

export interface IReview {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
}

export interface ReviewDto {
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: { type: Number, max: 5, default: 0 },
  comment: { type: String, required: true },
}, { timestamps: true });

export const validateReviewInput = (data: any) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
    }),
    comment: Joi.string().optional(),
  });

  return schema.validate(data);
};

export const Review = mongoose.model("Review", ReviewSchema);
