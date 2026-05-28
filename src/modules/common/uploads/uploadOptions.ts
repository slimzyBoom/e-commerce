import { Readable } from "node:stream";

export const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const uploadAvatarOptions = {
  folder: "ecommerce/avatars",
  resource_type: "image" as const,
  transformation: [
    { quality: "auto", fetch_format: "auto" },
    { width: 300, height: 300, crop: "fill", gravity: "face" },
  ],
};

export const uploadProductOptions = {
  folder: "ecommerce/products",
  resource_type: "image" as const,
  transformation: [
    { quality: "auto", fetch_format: "auto" },
    {
      width: 1000,
      height: 1000,
      crop: "limit",
    },
  ],
};
