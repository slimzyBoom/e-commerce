import express, { Request, Response, Router } from "express";
import passport from "passport";
import { HttpStatus } from "../../common/enums/StatusCodes";

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
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/v1/google/failure",
  }),
  (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.redirect(`https://exclusive-ecommerce-site-2kp1.vercel.app/profile`);
    } else {
      res.redirect("/auth/v1/google/failure");
    }
  }
);


router.get("/failure", (req: Request, res: Response) => {
  return res.status(HttpStatus.ServerError).json({
    status: "Server Error",
    message: "Login Failed",
    statuscode: HttpStatus.ServerError,
  });
});

export default router;
