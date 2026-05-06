// src/interfaces/User.ts
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstname: string;
  gender?: string;
  lastname: string;
  state?: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  retypePassword?: string; // This field is for validation only, not stored in DB
  isVerified: boolean;
  address?: string;
  phonenumber?: string;
  provider: [string];
  googleId?: string;
  phoneNumber?: string;
  roles: {
    User: number;
    Admin?: number;
  };
  refreshToken: String;
  otp?: string | null;
  expiresAt?: number | undefined;
}

export interface IRequestUser { 
  id: Types.ObjectId;
  roles: number[];
}

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUser;
    }
  }
}
export interface SessionUser {
  id: Types.ObjectId;
  accessToken: string;
}

export interface IResponse {
  success: Boolean;
  message: string;
  data?: object;
  errors?: object | string;
}

