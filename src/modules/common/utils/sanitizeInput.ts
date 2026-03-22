export const sanitizeEmail = (email : string) : string => {
  return email.replace(/(.{2}).+(@.+)/, '$1***$2');
};