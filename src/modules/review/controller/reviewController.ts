import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllProductReview, updateReview, deleteReview, addReview } from '../services/reviewService.js';
import { AppError } from '@common/errors/appErrors.js';
import { HttpStatus } from '@common/enums/StatusCodes.js';
import { Types } from 'mongoose';

export const getAllProductReviewController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    if (!productId || !Types.ObjectId.isValid(productId)) {
      throw new AppError("Must provide valid product id", HttpStatus.BadRequest);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const reviewData = await getAllProductReview(
      new Types.ObjectId(productId),
      { page, limit }
    );

    res.status(HttpStatus.Success).json({
      success: true,
      data: reviewData
    });
  }
);

export const addReviewController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId){
      throw new AppError("Unauthorized", HttpStatus.Unauthorized)
    }
    const { productId } = req.params;

    if (!productId || !Types.ObjectId.isValid(productId)) {
      throw new AppError("Must provide valid product id", HttpStatus.BadRequest);
    }

    const review = await addReview(userId, new Types.ObjectId(productId), req.body);

    res.status(HttpStatus.Created).json({
      success: true,
      data: review
    });
  }
);

export const updateReviewController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId){
      throw new AppError("Unauthorized", HttpStatus.Unauthorized)
    }
    const { reviewId } = req.params;
    const review = await updateReview(userId, new Types.ObjectId(reviewId), req.body);
    res.status(HttpStatus.Success).json({
      success: true,
      data: review
    });
  }
);

export const deleteReviewController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId){
      throw new AppError("Unauthorized", HttpStatus.Unauthorized)
    }
    const { reviewId } = req.params;
    const review = await deleteReview(userId, new Types.ObjectId(reviewId));
    res.status(HttpStatus.Success).json({
      success: true,
      data: review
    });
  }
);



