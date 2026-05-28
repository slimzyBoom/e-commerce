import mongoose from "mongoose";
import { Product } from "../../product/models/Product.js";
import { Request, Response } from "express";
import { Cart, validateCart, validateUpdateQueryCart } from "../models/Cart.js";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { AppError } from "@common/errors/appErrors.js";
import { v4 as uuidv4 } from "uuid";
import expressAsyncHandler from "express-async-handler";
import { getCartQuery, formatCart } from "../utils/cartUtils.js";
import { logger } from "@common/service/logger.js";

const getCartProducts = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const guestId = req.cookies?.guest_id;

    if (!guestId && !userId) {
      logger.error("No active session id");
      throw new AppError("Something went wrong", HttpStatus.ServerError);
    }

    const cart = await Cart.findOne(getCartQuery(userId, guestId)).populate({
      path: "items.product",
      model: "Product",
      select: "name category images",
    }).lean();

    if (!cart) {
      throw new AppError("Cart not found ", HttpStatus.NotFound);
    }
    const formattedCart = formatCart(cart);

    res.status(HttpStatus.Success).json({
      success: true,
      data: formattedCart,
    });
  },
);

const addCartProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    let guestId = req.cookies?.guest_id;

    if (!userId && !guestId) {
      guestId = uuidv4();
      res.cookie("guest_id", guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    const { error, value } = validateCart(req.body);
    if (error) {
      throw new AppError(
        "Bad Request",
        HttpStatus.BadRequest,
        error.details[0].message,
      );
    }
    const { productId } = value;

    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid product id", HttpStatus.BadRequest);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", HttpStatus.NotFound);
    }
    let cart = await Cart.findOne(getCartQuery(userId, guestId));
    if (!cart) {
      cart = await Cart.create({
        userId: userId || null,
        guestId: !userId ? guestId : null,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > product.unit) {
        throw new AppError("Insufficient stock", HttpStatus.BadRequest);
      }

      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        unit_price: product.price,
        quantity: 1,
        discount_price: product.discountPrice ?? 0,
      });
    }

    await cart.save();

    const formatedCart = formatCart(cart);

    res.status(HttpStatus.Success).json({
      success: true,
      message: "Item added to cart",
      data: formatedCart,
    });
  },
);

const updateCartProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { error: queryError, value: queryValue } = validateUpdateQueryCart(
      req.query,
    );
    if (queryError) {
      throw new AppError(
        "Bad request",
        HttpStatus.BadRequest,
        queryError.details[0].message,
      );
    }

    const { increment } = queryValue;

    const userId = req.user?.id;
    const guestId = req.cookies?.guest_id;

    if (!guestId && !userId) {
      throw new AppError("Something went wrong", HttpStatus.ServerError);
    }

    const { error, value } = validateCart(req.body);
    if (error) {
      throw new AppError(
        "Bad Request",
        HttpStatus.BadRequest,
        error.details[0].message,
      );
    }
    const { productId } = value;

    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid product id", HttpStatus.BadRequest);
    }
    const cart = await Cart.findOne(getCartQuery(userId, guestId));

    if (!cart) {
      throw new AppError("Cart not found", HttpStatus.NotFound);
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!existingItem) {
      throw new AppError("Product not found in cart", HttpStatus.NotFound);
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      throw new AppError("Something went wrong", HttpStatus.ServerError);
    }
    if (increment) {
      if (existingItem.quantity >= product.unit) {
        throw new AppError("Insufficient stock", HttpStatus.BadRequest);
      }

      existingItem.quantity += 1;
    }
    else{
      if(existingItem.quantity <= 1){
        throw new AppError("Quantity must be at least one", HttpStatus.BadRequest)
      }   
      existingItem.quantity -= 1;   
    }
    await cart.save();

    const formatedCart = formatCart(cart);

    res.status(HttpStatus.Success).json({
      success: true,
      data: formatedCart,
    });
  },
);

const removeCartProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const guestId = req.cookies?.guest_id;
    if (!guestId && !userId) {
      throw new AppError("Something went wrong", HttpStatus.ServerError);
    }

    const { productId } = req.body;

    if (!productId) {
      throw new AppError("Product id is required", HttpStatus.BadRequest);
    }

    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid product id", HttpStatus.BadRequest);
    }

    const cart = await Cart.findOne(getCartQuery(userId, guestId));

    if (!cart) {
      throw new AppError("Cart not found", HttpStatus.NotFound);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );

    if (itemIndex === -1) {
      throw new AppError("Product not found in cart", HttpStatus.NotFound);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const formatedCart = formatCart(cart);

    res.status(HttpStatus.Success).json({
      success: true,
      message: "Product removed from cart",
      data: formatedCart,
    });
  },
);

export {
  getCartProducts,
  addCartProduct,
  updateCartProduct,
  removeCartProduct,
};
