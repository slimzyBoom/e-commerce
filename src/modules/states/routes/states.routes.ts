import { Router } from 'express';
import { getStatesController, getStateLGAController } from '@states/controller/state.controller.js';

const router = Router();

router.get("/states/:stateIso/lgas", getStateLGAController);
router.get('/states', getStatesController);


export default router;
