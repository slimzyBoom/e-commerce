import { Product } from "@product/models/Product";
import { Review, ReviewDto, validateReviewInput } from "../model/Review";
import { Types } from "mongoose";
import { HttpStatus } from "@common/enums/StatusCodes";
import { AppError } from "@common/errors/appErrors";
import { calculateReviewStat } from "../utils/updateReveiwStat.utils";

export const getAllProductReview = async (
  productId: Types.ObjectId,
  filters?: { limit?: number; page?: number },
) => {
  const existingProduct = await Product.findById(productId).lean();

  if (!existingProduct) {
    throw new AppError("Product not found", HttpStatus.NotFound);
  }

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return reviews;
};

export const addReview = async (
  userId: Types.ObjectId,
  productId: Types.ObjectId,
  reviewData: ReviewDto,
) => {
  const existingProduct = await Product.findById(productId).lean();
  if (!existingProduct) {
    throw new AppError("Product not found", HttpStatus.NotFound);
  }

  const { error } = validateReviewInput(reviewData);
  if(error){
    throw new AppError("Bad request", HttpStatus.BadRequest, error.details[0].message)
  }

  const existingReview = await Review.findOne({ productId, userId }).lean();
  if(existingReview){
    throw new AppError("You have already reviewed this product", HttpStatus.Conflict)
  }

  const review = await Review.create({
    userId,
    productId,
    rating: reviewData.rating,
    comment: reviewData.comment || "",
  });

  await calculateReviewStat(productId);
  return review;
};

export const updateReview = async (
  userId: Types.ObjectId,
  reviewId: Types.ObjectId,
  reviewData: Partial<ReviewDto>,
) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", HttpStatus.NotFound);
  }
  if(!review.userId.equals(userId)){
    throw new AppError("Not allowed to update this review", HttpStatus.Unauthorized);
  }
  if(reviewData.rating !== undefined) {
    review.rating = reviewData.rating;
    await calculateReviewStat(review.productId);
  }
  if(reviewData.comment !== undefined) review.comment = reviewData.comment;

  await review.save();

  return review;
};
export const deleteReview = async (userId: Types.ObjectId, reviewId: Types.ObjectId) => {

  const review = await Review.findById(reviewId);
  if(!review){
    throw new AppError("Review not found", HttpStatus.NotFound);
  }

  if(!review.userId.equals(userId)){
    throw new AppError("Not allowed to delete this review", HttpStatus.Unauthorized);
  }

  await review.deleteOne();
  await calculateReviewStat(review.productId);
  2
  return review;
};
