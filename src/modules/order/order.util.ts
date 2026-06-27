import { ICartItem, ICart } from "modules/cart/interfaces/cart.js"
import { IOrderItem } from "./order.interface.js";
import { Product } from "@product/models/Product.js";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { roundToTwo } from "modules/seed.js";
const shipping_threshold = Number(process.env.SHIPPING_FEE_THRESHOLD );

export const validateCheckoutCart = async (
  cart: ICart
) => {
  const validatedItems: IOrderItem[] = [];

  let subtotal = 0;

  const productIds = cart.items.map((item: ICartItem) => item.product);
  const cartProducts = await Product.find({
    _id: { $in : productIds }
  })
  const productsMap = new Map(cartProducts.map(products => [products._id.toString(), products]))
  for (const item of cart.items) {
    const product = productsMap.get(item.product.toString())

    // Product deleted
    if (!product) {
      continue;
    }

    // Out of stock
    if (product.unit <= 0) {
      continue;
    }

    // Quantity exceeds stock
    if (item.quantity > product.unit) {
      throw new AppError(
        `${product.name} only has ${product.unit} left in stock`,
        HttpStatus.BadRequest
      );
    }

    // Get latest active price
    const activePrice =
      product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const itemSubtotal =
      activePrice * item.quantity;

    subtotal += itemSubtotal;

    validatedItems.push({
      product: product._id,
      product_name: product.name,

      quantity: item.quantity,

      unit_price: product.price,

      discount_price:
        product.discountPrice ?? 0,

      sub_total: itemSubtotal,
    });
  }

  return {
    items: validatedItems,
    sub_total: subtotal,
  };
};

export const calculateFees = (price: number) => {
  let shipping_fee;
  if(price >= shipping_threshold){
    shipping_fee = 0;
  }
  shipping_fee = 5000; // Probably change later
  const tax_fee = roundToTwo(price * 0.05) // 5%

  return { shipping_fee, tax_fee }
}

export function convertNairaToKobo(amount: number): string {
  const koboAmount = Math.round(amount * 100);
  return String(koboAmount)
}