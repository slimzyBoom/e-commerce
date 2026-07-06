import { Response } from "express";

export const setTokens = async (
  res: Response,
  refreshToken: string,
): Promise<void> => {
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: process.env.NODE_ENV === "production",
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "none",
  //   maxAge: 24 * 60 * 60 * 1000,
  // });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};
