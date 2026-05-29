import { Types } from "mongoose";

export enum OrderStatus {
    PENDING="pending",
    PROCESSING="processing",
    SHIPPED="shipped",
    DELIVERED="delivered",
    CANCELLED="cancelled",
    REFUNDED="refunded"
}
export enum PaymentStatus {
    PENDING="pending",
    PAID="paid",
    REFUNDED="refunded",
    FAILED="failed"
}

interface ShippingInfo {
    full_name : string;
    email: string;
    phone_number: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: number
}

export interface IOrder {
    user_id: Types.ObjectId;
    order_number: string;
    sub_total: number;
    currency: string;
    total_amount: number;
    shipping_fee: number;
    tax_fee: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_reference: string;
    payment_provider: string;
    paid_at: Date;
    shipping_info: ShippingInfo;
    items: IOrderItem[];
} 

export interface IOrderItem {
    product: Types.ObjectId;
    product_name: string;
    unit_price: number;
    discount_price: number;
    quantity: number;
    sub_total: number;
}