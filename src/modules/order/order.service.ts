import { Cart } from "modules/cart/models/Cart.js"

import { calculateFees, validateCheckoutCart } from "./order.util.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { Types } from "mongoose";

const prviewCartService = async (userId: Types.ObjectId) => {
    const cart = await Cart.findOne({ userId, status: "active" }).lean();
    if(!cart){
        throw new AppError("Cart not found", HttpStatus.NotFound)
    }
    const {items: valid_cart_items, sub_total: cart_sub_total } = await validateCheckoutCart(cart);
    const { shipping_fee, tax_fee } = calculateFees(cart_sub_total);
    
}