import bcrypt from "bcryptjs";

export const validatePassword = async (
  password: string,
  passwordCompare : string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordCompare);
};
