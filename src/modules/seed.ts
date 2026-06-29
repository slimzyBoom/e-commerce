import axios from "axios";
import { Response, Request, Router } from "express";
const router = Router();
import expressAsyncHandler from "express-async-handler";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Product } from "@product/models/Product.js";

interface SeedProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: number;
  avgRating: number;
  reviewCount: number;
}

export const roundToTwo = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

const getDummyProducts = async (): Promise<SeedProductDto | undefined> => {
  try {
    const response = await axios.get("https://dummyjson.com/products");
    const products = response.data.products;
    const serializedProducts = products.map((product: any) => ({
      name: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      discountPrice: roundToTwo(product.price - (product.price * product.discountPercentage) / 100),
      category: product.category,
      unit: product.stock,
      avgRating: product.rating,
      reviewCount: product.reviews ? product.reviews.length : 0,
      
    }));
    return serializedProducts;
  } catch (error) {
    console.log(`Error getting dummy product data: ${error}`);
    throw new AppError(
      "Failed to fetch dummy product data",
      HttpStatus.ServerError,
    );
  }
};

const seedProducts = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const existingProducts = await Product.estimatedDocumentCount();
    if (existingProducts > 0) {
      res
        .status(HttpStatus.BadRequest)
        .json({
          message: "Products already exist in the database. Seeding aborted.",
        });
      return;
    }
    const dummyProducts = await getDummyProducts();
    const seededProducts = await Product.insertMany(dummyProducts);
    if (seededProducts.length === 0) {
      throw new AppError("Failed to seed products", HttpStatus.ServerError);
    }
    res
      .status(HttpStatus.Created)
      .json({ success: true, message: "Products seeded successfully" });
  },
);

router.get("/dummy-products", seedProducts);

export default router;
