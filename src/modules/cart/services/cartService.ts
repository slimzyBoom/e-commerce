import { Cart } from "../models/Cart.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose"

export const getActiveCart = async (userId: Types.ObjectId) => {
  const cart = await Cart.findOne({
    userId,
    status: "active",
  });

  if (!cart) {
    throw new AppError(
      "Cart not found",
      HttpStatus.NotFound
    );
  }

  return cart;
}