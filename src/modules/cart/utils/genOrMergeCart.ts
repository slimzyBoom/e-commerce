import { Cart } from "../models/Cart.js";
import { Product } from "@product/models/Product.js";
import { Types } from "mongoose";

export const mergeGuestCartIntoUserCart = async (
  guestId: string,
  userId: Types.ObjectId,
) => {
  const guestCart = await Cart.findOne({
    guestId,
    status: "active",
  });

  if (!guestCart) return null;

  let userCart = await Cart.findOne({
    userId,
    status: "active",
  });

  /**
   * If user has no cart,
   * simply transfer ownership
   */
  if (!userCart) {
    guestCart.userId = userId;
    guestCart.guestId = undefined;

    await guestCart.save();

    return guestCart;
  }

  /**
   * Merge logic
   */
  const mergedItemsMap = new Map();

  /**
   * Add user cart items first
   */
  for (const item of userCart.items) {
    mergedItemsMap.set(item.product.toString(), {
      product: item.product,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_price: item.discount_price,
    });
  }

  /**
   * Merge guest cart items
   */
  for (const guestItem of guestCart.items) {
    const productId = guestItem.product.toString();

    const latestProduct = await Product.findById(productId);

    /**
     * Product no longer exists
     */
    if (!latestProduct) {
      continue;
    }

    const availableStock = latestProduct.unit;

    if (mergedItemsMap.has(productId)) {
      const existingItem = mergedItemsMap.get(productId);

      const mergedQuantity = existingItem.quantity + guestItem.quantity;

      /**
       * Cap quantity to stock
       */
      existingItem.quantity = Math.min(mergedQuantity, availableStock);

      existingItem.unit_price = latestProduct.price;

      existingItem.discount_price = latestProduct.discountPrice;

      mergedItemsMap.set(productId, existingItem);
    } else {
      mergedItemsMap.set(productId, {
        product: latestProduct._id,

        quantity: Math.min(guestItem.quantity, availableStock),

        unit_price: latestProduct.price,

        discount_price: latestProduct.discountPrice,
      });
    }
  }

  /**
   * Convert map back to array
   */
  userCart.items = Array.from(mergedItemsMap.values());

  await userCart.save();

  /**
   * Delete guest cart
   */
  await Cart.findByIdAndDelete(guestCart._id);
};
