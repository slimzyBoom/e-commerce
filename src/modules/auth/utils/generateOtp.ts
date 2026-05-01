let otpStore: { [key: string]: string } = {};
import bcrypt from "bcryptjs"

export const generateOtp = async (): Promise<string> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

export const hashOtp = async (otp: string) : Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
}

