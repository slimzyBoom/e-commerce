import { ProductDto, Product, validateProduct } from "@product/models/Product";
import { AppError } from "@common/errors/appErrors";
import { HttpStatus } from "@common/enums/StatusCodes";
import { Types } from "mongoose";


interface ProductFilter {
  category?: string;
  inStock?: boolean;
  sort?: "price" | "rating" | "createdAt" |"-price" | "-rating" | "-createdAt";
  search?: string;

}

export const createProductService = async (productData: ProductDto) => {
  const { error } = validateProduct(productData);
  if(error){
    throw new AppError("Bad request", HttpStatus.BadRequest, error.details[0].message)
  }
  const product = await Product.create(productData);

  return product;
}

export const updateProductService = async (productId: Types.ObjectId, updateData: Partial<ProductDto>) => {
  const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
  if(!updatedProduct){
    throw new AppError("Product not found", HttpStatus.NotFound)
  }
  return updatedProduct;
}

export const getAllProductsService = async (filterData: Partial<ProductFilter>) => {
  let query : any = {};
  if(filterData.category){
    query.category = filterData.category;
  }
  if(filterData.inStock){
    query.unit = { $gt: 0 };
  }
  if(filterData.search){
    query.$or = [
      { name: { $regex: filterData.search, $options: "i" }},
      { description : { $regex: filterData.search, $options: "i" }}
    ]
  }

  const products = await Product.find(query).sort(filterData.sort || "-createdAt").limit(10).lean();
  return products;
}

export const getProductByIdService = async (productId: Types.ObjectId) => {
  const product = await Product.findById(productId).lean();
  if(!product){
    throw new AppError("Product not found", HttpStatus.NotFound)
  }
  return product;
}
export const deleteProductService = async (productId: Types.ObjectId) => {
  const product = await Product.findByIdAndDelete(productId);
  if(!product){
    throw new AppError("Product not found", HttpStatus.NotFound)
  }
  return product;
}
