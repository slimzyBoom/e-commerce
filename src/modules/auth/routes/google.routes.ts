import express, { Request, Response, Router } from "express";
import passport from "passport";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { generateRefreshToken } from "@auth/utils/genRefreshToken.js";
import { setTokens } from "@auth/utils/tokenGenerator.js";

const router = Router();

// Route to initiate Google authentication
router.get(
  "/",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/user.phonenumbers.read",
    ],
  }),
);

router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/v1/google/failure",
  }),
  (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const { id } = req.user;
      const refreshToken = generateRefreshToken(id);
      setTokens(res, refreshToken);
      res.redirect(`https://exclusive-ecommerce-site-2kp1.vercel.app/profile`);
    } else {
      res.redirect("/auth/v1/google/failure");
    }
  },
);

router.get("/failure", (req: Request, res: Response) => {
  return res.status(HttpStatus.ServerError).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;
