export const sanitizeEmail = (email: string): string => {
  return email.replace(/(.{2}).+(@.+)/, "$1***$2");
};
export const normalizeRoles = (roles: any): number[] => {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === "object" && roles !== null) {
    return Object.values(roles).filter(
      (value): value is number => typeof value === "number",
    );
  }
  return [];
};
