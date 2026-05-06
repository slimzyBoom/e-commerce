import { Router } from 'express';
import { createProductController, updateProductController, getAllProductsController, getProductByIdController, deleteProductController } from '../controller/Product';
import { Roles } from '@common/enums/roles';
import verifyUserAcces from '@common/middlewares/verifyaccess';
const router = Router();


router.get('/', getAllProductsController);             
router.get('/:id', getProductByIdController); 

router.use(verifyUserAcces([Roles.Admin]))          
router.post('/', createProductController);                
router.put('/:id', updateProductController);                
router.delete('/:id', deleteProductController);             

export default router;
