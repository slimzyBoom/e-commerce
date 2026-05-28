import { Router } from 'express';
import { createProductController, updateProductController, getAllProductsController, getProductByIdController, deleteProductController, getCategoriesController } from '../controller/productController.js';
import { Roles } from '@common/enums/roles.js';
import verifyUserAcces from '@common/middlewares/verifyaccess.js';
import upload from '@common/config/multerConfig.js';
const router = Router();


router.get('/categories', getCategoriesController); 
router.get('/', getAllProductsController);            
router.get('/:id', getProductByIdController); 

router.use(verifyUserAcces([Roles.Admin]))          
router.post('/', upload.array("images", 5), createProductController);                
router.put('/:id', updateProductController);                
router.delete('/:id', deleteProductController);             

export default router;
