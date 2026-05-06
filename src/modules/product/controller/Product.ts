import { Request, Response } from 'express';
import { createProductService, updateProductService, getAllProductsService, getProductByIdService, deleteProductService } from '@product/services/Product.Service';
import { HttpStatus } from "../../common/enums/StatusCodes";
import expressAsyncHandler from 'express-async-handler';
import { Types } from "mongoose";
import { AppError } from '@common/errors/appErrors';

export const createProductController = expressAsyncHandler(
  async (req: Request, res : Response) => {
    const product = await createProductService(req.body);
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

// class ProductController {
//   async createProduct(req: Request, res: Response) {
//     try {
//       const { error } = validateProduct(req.body);
      
//       if (error) {
//         return res.status(HttpStatus.BadRequest).json({ message: error.details[0].message });
//       }

//       const product = await ProductService.createProduct(req.body);
//       res.status(HttpStatus.Created).json(product);
//     } catch (error) {
//      if(error instanceof Error){
//         res.status(HttpStatus.BadRequest).json({ message: error.message });
//      }
//     }
//   }


//   async getAllProducts(req: Request, res: Response) {
//     try {
       
//         const { category, limit, page, sort } = req.query;
        
       
//         let filter: any = {};
//         let options: any = { limit: 10, skip: 0, sort: {} }; // Default limit = 10, page = 1

       
//         if (category) {
//             filter.category = category;
//         }

      
//         if (page && limit) {
//             options.skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
//             options.limit = parseInt(limit as string, 10);
//         }

       
//         if (sort) {
//             options.sort[sort as string] = 1; 
//         }

       
//         const products = await ProductService.getAllProducts(filter, options);

//         res.status(HttpStatus.Success).json(products);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(HttpStatus.BadRequest).json({ message: error.message });
//         }
//     }
// }


//   async getProductById(req: Request, res: Response) {
//     const { id } = req.params; 
//     try {
//       const product = await ProductService.getProductById(id);
//       res.status(HttpStatus.Success).json(product);
//     } catch (error) {
//         if(error instanceof Error){
//             res.status(HttpStatus.BadRequest).json({ message: error.message });
//          }
//     }
//   }

//   async updateProduct(req: Request, res: Response) {
//     const { error } = validatePutProduct(req.body);
//     if (error) {
//       return res.status(HttpStatus.BadRequest).json({ message: error.details[0].message });
//     }
//     try {
//       const updatedProduct = await ProductService.updateProduct(req.params.id, req.body);
//       res.status(HttpStatus.Success).json(updatedProduct);
//     } catch (error) {
//       if(error instanceof Error){
//           res.status(HttpStatus.BadRequest).json({ message: error.message });
//       }
//     }
// }
// async deleteProduct(req: Request, res: Response) {
//     try {
//       const deletedProduct = await ProductService.deleteProduct(req.params.id);
//       res.status(HttpStatus.Success).json({ message: 'Product deleted successfully', product: deletedProduct });
//     } catch (error) {
//       if(error instanceof Error){
//           res.status(HttpStatus.BadRequest).json({ message: error.message });
//       }
//     }
// }

// }

// export default new ProductController();
