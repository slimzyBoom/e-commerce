import { Request, Response } from "express";
import { HttpStatus } from "@common/enums/StatusCodes";
import expressAsyncHandler from "express-async-handler";
import { getAuthHealth } from "@auth/utils/authHealth";

export const authHealthController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const healthStatus = await getAuthHealth();
    req.log.info("Auth health check performed");
    res.status(HttpStatus.Success).json({
      status: "success",
      data: healthStatus,
    });
  },
);
