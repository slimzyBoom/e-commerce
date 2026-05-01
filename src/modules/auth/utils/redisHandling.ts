import { redisClient } from "@common/config/redisClient";
import { OTP_STATIC_VALUE } from "@auth/static/otp.static";

interface PendingUser {
  email: string;
  firstname: string;
  lastname: string;
  state: string;
  otp: string;
  password: string;
}

const otpExpiry = OTP_STATIC_VALUE.OTP_EXPIRY_TIME / 1000;

const checkUserExistingCache = async (email: string): Promise<boolean> => {
    return await redisClient.exists(`pending_user:${email}`) === 1;
};

const cacheUserData = async (userData: PendingUser) => {
  const createdAt = new Date().toISOString();
  await redisClient
    .multi()
    .hSet(`pending_user:${userData.email}`, {
      firstname: userData.firstname,
      lastname: userData.lastname,
      state: userData.state,
      email: userData.email,
      password: userData.password,
      otp: userData.otp,
      createdAt,
    })
    .expire(`pending_user:${userData.email}`, otpExpiry)
    .exec();
};

const updateUserCacheOtp = async (email: string, otp: string) => {
    const key = `pending_user:${email}`
    await redisClient
  .multi()
  .hSet(key, { otp })
  .expire(key, otpExpiry)
  .exec();
}

const getAttempts = async (email: string) => {
    const currentAttempt = await redisClient.get(`pending_user_attempts:${email}`);
    return currentAttempt ? parseInt(currentAttempt, 10) : 0;
}

const cacheOtp = async (email: string, otp: string) => {
    await redisClient.set(`request_password_reset:${email}`, otp, {
        EX: otpExpiry
    })
}

const getOtpFromCache = async (email: string) => {
    return await redisClient.get(`request_password_reset:${email}`);
}

const getUserDataFromCache = async (email: string) => {
    return await redisClient.hGetAll(`pending_user:${email}`);
}

const deleteUserAndAttempts = async (email: string) => {
    await redisClient.del(`pending_user:${email}`);
    await redisClient.del(`pending_user_attempts:${email}`);
}

// Update attempts during retrying OTP verification
const updateAttempts = async (email: string) => {
    await redisClient.incr(`pending_user_attempts:${email}`);
    const ttl = await redisClient.ttl(`pending_user:${email}`);
    await redisClient.expire(`pending_user_attempts:${email}`, ttl);
}

export { checkUserExistingCache, cacheUserData, getAttempts, deleteUserAndAttempts, updateAttempts, getUserDataFromCache, cacheOtp, getOtpFromCache, updateUserCacheOtp };