import mongoose, { Schema } from "mongoose";
import { I_Image } from "@interfaces/Images.js";

const imageSchema = new Schema<I_Image>({
    public_id: { type: String, required: true },
    secure_url: { type: String, required: true },
    ownerType : { type: String, enum: ["User", "Product", "Category"], required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true, refPath: 'ownerType' },
});

export const Image = mongoose.model<I_Image>("Image", imageSchema);