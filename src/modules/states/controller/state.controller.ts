import { Request, Response } from "express";
import {
  getAllStateLGAService,
  getAllStatesService,
} from "@states/services/state.service.js";
import expressAsyncHandler from "express-async-handler";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { AppError } from "@common/errors/appErrors.js";

export const getStatesController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const states = await getAllStatesService();
    if (!states || states.length === 0) {
      throw new AppError("No states found", HttpStatus.NotFound);
    }
    res.status(HttpStatus.Success).json({ success: true, data: states});
  },
);

export const getStateLGAController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { stateIso } = req.params;
    if(!stateIso) {
      throw new AppError("State ISO code is required", HttpStatus.BadRequest);
    }
    const lgas = await getAllStateLGAService(stateIso);
    if (!lgas || lgas.length === 0) {
      throw new AppError("No LGAs found for the specified state", HttpStatus.NotFound);
    }
    res.status(HttpStatus.Success).json({ success: true, data: lgas });
  }
)
