// src/interfaces/Cart.ts
import {  Types, HydratedDocument } from "mongoose";

export interface ICart {
  userId?: Types.ObjectId;
  guestId?: string;
  status: "active" | "checked_out" | "expired";
  items: ICartItem[];
}


export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  unit_price: number;
  discount_price: number;
}

export type ICartDoc = HydratedDocument<ICart>

export enum CartStatus {
  Active = "active",
  CheckedOut = "checked_out",
  Expired = "expired",
}
