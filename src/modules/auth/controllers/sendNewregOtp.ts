import { Response, Request } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes";
import { generateOtp } from "../utils/generateOtp";
import { sendOTPEmail } from "../../common/utils/sendEmail";
import expressAsyncHandler from "express-async-handler";
import { updateRegisterOtpService } from "@auth/services/sendNewRegOtp.service";


export const updateRegisterOtpController = expressAsyncHandler( async (req: Request, res: Response) => {
  await updateRegisterOtpService(req.body);
  res.status(HttpStatus.Success).json({
    success: true,
    message: "Otp resent to email"
  })
})

// const newRegistrationOtp = async (
//   req: Request,
//   res: Response
// ): Promise<Response | undefined> => {
//   const { OTP_EXPIRY_TIME } = OTP_STATIC_VALUE;

//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(HttpStatus.BadRequest).json({
//         status: "Bad request",
//         message: "Email is required to generate an OTP.",
//         statusCode: HttpStatus.BadRequest,
//       });
//     }

//     const userData = await redisClient.hGetAll(`pending_user:${email}`);
//     if (!userData || Object.keys(userData).length === 0) {
//       return res.status(HttpStatus.BadRequest).json({
//         status: "Bad request",
//         message:
//           "No user pending registration with this email. Please register first.",
//         statusCode: HttpStatus.BadRequest,
//       });
//     }

//     const otpExpiry = OTP_EXPIRY_TIME / 1000;
//     const OTP = await generateOtp();

//     // Update an existing pending user 
//     await redisClient.hSet(`pending_user:${email}`, {
//       otp: OTP,
//       createdAt: new Date().toISOString(),
//     });
//     await redisClient.expire(`pending_user:${email}`, otpExpiry);


//     // const result = await sendOTPEmail(
//     //   email as string,
//     //   OTP,
//     //   "Your new one-time Email verification code is:"
//     // );

//     res.status(HttpStatus.Created).json({
//       status: "success",
//       message: "OTP sent successfully",
//     });

//   } catch (error) {
//     return res.status(HttpStatus.ServerError).json({
//       status: "error",
//       message: "Internal server error",
//       error: `${error} error`,
//       statusCode: HttpStatus.ServerError,
//     });
//   }
// };

// export default newRegistrationOtp;
