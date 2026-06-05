import {
  ProductDto,
  Product,
  validateCreateProduct,
  validateProductFilter,
} from "@product/models/Product.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose";
import { uploadProductImages } from "@common/uploads/productUpload.js";
import { Image } from "@auth/models/Image.js";
import { UploadResult } from "@interfaces/Images.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

interface ProductFilter {
  category?: string;
  inStock?: string;
  sort?: "price" | "rating" | "createdAt" | "-price" | "-rating" | "-createdAt";
  search?: string;
}

export const createProductService = async (
  productData: ProductDto,
  files: Express.Multer.File[],
) => {
  const { error } = validateCreateProduct(productData);
  if (error) {
    throw new AppError(error.details[0].message, HttpStatus.BadRequest);
  }
  const session = await mongoose.startSession();

  let uploadResults: UploadResult[] = [];

  try {
    // Upload images first
    uploadResults = await uploadProductImages(files);

    let createdProduct;

    await session.withTransaction(async () => {
      // Create unsaved product instance
      const product = new Product(productData);

      // Create image documents
      const imageDocs = await Promise.all(
        uploadResults.map(async (image) => {
          return await Image.create(
            [
              {
                public_id: image.public_id,
                secure_url: image.secure_url,
                ownerType: "Product",
                ownerId: product._id,
              },
            ],
            { session },
          );
        }),
      );

      // Extract image ids
      const imageIds = imageDocs.map((doc) => doc[0]._id);

      // Attach image references
      product.images = imageIds;

      // Save product
      createdProduct = await product.save({
        session,
      });
    });

    return createdProduct;
  } catch (error) {
    // Cleanup cloudinary uploads
    await Promise.all(
      uploadResults.map((image) =>
        cloudinary.uploader.destroy(image.public_id),
      ),
    );

    throw error;
  } finally {
    session.endSession();
  }
};

export const updateProductService = async (
  productId: Types.ObjectId,
  updateData: Partial<ProductDto>,
) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true },
  );
  if (!updatedProduct) {
    throw new AppError("Product not found", HttpStatus.NotFound);
  }
  return updatedProduct;
};

export const getAllProductsService = async (
  filterData: Partial<ProductFilter>,
) => {
  const { error, value } = validateProductFilter(filterData);
  if (error) {
    throw new AppError(error.details[0].message, HttpStatus.BadRequest);
  }
  const query: any = {};
  if (value.category) {
    query.category = value.category;
  }
  if (value.inStock) {
    query.unit = { $gt: 0 };
  }
  if (value.search) {
    query.$text = { $search: value.search };
  }
  // Add dynamic attribute filters
  // if (value.attributes) {
  //   for (const [key, val] of Object.entries(value.attributes)) {
  //     // Dynamically build paths like: query["attributes.color"] = "Black"
  //     query[`attributes.${key}`] = val;
  //   }
  // }
  const products = await Product.find(query)
    .sort(value.sort || "-createdAt")
    .limit(10)
    .select(
      "name description price discountPrice category images unit avgRating",
    )
    .lean();
  if (products.length === 0) {
    throw new AppError("No products found", HttpStatus.NotFound);
  }
  return products;
};

export const getProductByIdService = async (productId: Types.ObjectId) => {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new AppError("Product not found", HttpStatus.NotFound);
  }
  return product;
};
export const deleteProductService = async (productId: Types.ObjectId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new AppError("Product not found", HttpStatus.NotFound);
  }
  return product;
};

export const getCategoriesService = async () => {
  const categories = await Product.distinct("category");
  return categories;
};
