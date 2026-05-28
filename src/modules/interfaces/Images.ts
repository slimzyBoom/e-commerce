import { Types } from "mongoose";
export interface I_Image {
    public_id: string;
    secure_url: string;
    ownerType: "User" | "Product" | "Category";
    ownerId: Types.ObjectId;
}
export interface UploadResult {
  public_id: string;
  secure_url: string;
}