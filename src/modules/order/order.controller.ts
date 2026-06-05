import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { previewCartService } from "./order.service.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";

export const previewCartController = expressAsyncHandler( async (req: Request, res: Response ) => {
    const userId = req.user?.id;
    if(!userId){
        throw new AppError("User unathorized", HttpStatus.Unauthorized)
    }
    const cartPreview = await previewCartService(userId);
    res.json({ success: true, data: cartPreview })
})