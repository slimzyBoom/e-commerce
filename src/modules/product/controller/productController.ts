import { Request, Response } from 'express';
import { createProductService, updateProductService, getAllProductsService, getProductByIdService, deleteProductService, getCategoriesService } from '@product/services/Product.Service.js';
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import expressAsyncHandler from 'express-async-handler';
import { Types } from "mongoose";
import { AppError } from '@common/errors/appErrors.js';

export const createProductController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    if(!req.files || (Array.isArray(req.files) && req.files.length === 0)){
      throw new AppError("Product images are required", HttpStatus.BadRequest);
    }
    const product = await createProductService(req.body, req.files as Express.Multer.File[]);
    res.status(HttpStatus.Created).json({ success: true, data: product });
  }
);
export const updateProductController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const { id } = req.params;
    if(!Types.ObjectId.isValid(id)){
      throw new AppError("Invalid product ID", HttpStatus.BadRequest);
    }
    const productId = new Types.ObjectId(id);
    const product = await updateProductService(productId, req.body);
    res.status(HttpStatus.Success).json({ success: true, data: product });
  }
);
export const getProductByIdController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const { id } = req.params;
    if(!Types.ObjectId.isValid(id)){
      throw new AppError("Invalid product ID", HttpStatus.BadRequest);
    }
    const productId = new Types.ObjectId(id);
    const product = await getProductByIdService(productId);
    res.status(HttpStatus.Success).json({ success: true, data: product });
  }
);
export const getAllProductsController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const filters = req.query;
    const products = await getAllProductsService(filters);
    res.status(HttpStatus.Success).json({ success: true, data: products });
  }
);
export const deleteProductController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const { id } = req.params;
    if(!Types.ObjectId.isValid(id)){
      throw new AppError("Invalid product ID", HttpStatus.BadRequest);
    }
    const productId = new Types.ObjectId(id);
    const product = await deleteProductService(productId);
    res.status(HttpStatus.Success).json({ success: true, data: product });
  }
);

export const getCategoriesController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const categories = await getCategoriesService();
    res.status(HttpStatus.Success).json({ success: true, data: categories });
  }
);