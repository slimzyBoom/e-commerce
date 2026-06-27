import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { previewCartService, initializeCheckoutService, verifyCheckoutService
 } from "./order.service.js";
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

export const initializeCheckoutController = expressAsyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("User unathorized", HttpStatus.Unauthorized);
        }
        const checkoutDetails = await initializeCheckoutService(userId, req.body);
        res.json({ success: true, data: checkoutDetails });
    }
)

export const verifyCheckoutController = expressAsyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { reference } = req.params;
        if(!userId){
            throw new AppError("User unathorized", HttpStatus.Unauthorized)
        }
        if(!reference){
            throw new AppError("Reference is required", HttpStatus.BadRequest)
        }
        const verificationResult = await verifyCheckoutService(userId, reference);
        res.json({ success: true, message: verificationResult.message });
    }
)