import { Review } from "../model/Review.js";
import { Product } from "@product/models/Product.js";
import { Types } from "mongoose";

interface ReviewStats {
  _id: Types.ObjectId;
  avgRating: number;
  count: number;
}
// To be used when a review has been created or updated and deleted 
export const calculateReviewStat = async (productId: Types.ObjectId) => {
  const stats = await Review.aggregate<ReviewStats>([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    avgRating: stats[0].avgRating || 0,
    reviewCount: stats[0].count || 0,
  });
};
