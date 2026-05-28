import { uploadProductOptions, allowedTypes } from "./uploadOptions.js";
import { UploadResult } from "@interfaces/Images.js";
import { bufferToStream } from "./uploadOptions.js";
import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";

export const uploadProductImages = async (
  files: Express.Multer.File[],
) => {
  const uploads = files.map(async (file) => {
    const { buffer } = file;

    const fileType = await fileTypeFromBuffer(new Uint8Array(buffer));

    if (!fileType || !allowedTypes.includes(fileType.mime)) {
      throw new AppError(
        "Invalid file type.",
        HttpStatus.BadRequest,
      );
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadProductOptions,
        (error, uploaded) => {
          if (error) return reject(error);

          if (!uploaded) {
            return reject(new Error("File upload failed"));
          }

          resolve({
            public_id: uploaded.public_id,
            secure_url: uploaded.secure_url,
          });
        },
      );

      bufferToStream(buffer).pipe(uploadStream);
    });
  });

  return Promise.all(uploads);
};