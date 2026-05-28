import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose";
import { ICart } from "../interfaces/cart.js";

export const getCartQuery = (
  userId?: Types.ObjectId,
  guestId?: Types.ObjectId
) => {
  if (userId) {
    return {
      userId,
      guestId: null,
      status: "active",
    };
  }

  if (guestId) {
    return {
      guestId,
      userId: null,
      status: "active",
    };
  }

  throw new AppError(
    "Unauthorized",
    HttpStatus.Unauthorized
  );
};

export const formatCart = (cart: ICart) => {
  const items = cart.items.map((item) => {
    const activePrice =
      item.discount_price > 0
        ? item.discount_price
        : item.unit_price;

    const subtotal =
      activePrice * item.quantity;

    return {
      product : item.product,
      quantity : item.quantity,
      unit_price : item.unit_price,
      discount_price: item.discount_price,
      subtotal,
    };
  });


  const total = items.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  const totalQuantity = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return {
    status: cart.status,
    items,
    total,
    totalQuantity,
  };
};