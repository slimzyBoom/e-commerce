// passportConfig.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../../auth/models/User.js";
import { generateRefreshToken } from "@auth/utils/genRefreshToken.js";
import { getPhoneNumber } from "@auth/utils/getGooglePhone.js"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_CALLBACK = process.env.GOOGLE_CALLBACK as string;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
    },
    async (accessToken, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account must have email"));
        }

        let user = await User.findOne({ email });

        const phoneNumber = await getPhoneNumber(accessToken);

        // Create new user
        if (!user) {
          user = await User.create({
            firstname: profile.name?.givenName || "",
            lastname: profile.name?.familyName || "",
            email,
            phoneNumber,
            provider: ["google"],
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value || null,
          });
        } else {
          // Link existing account to Google if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
          }

          if (!user.provider.includes("google")) {
            user.provider.push("google");
          }
        }

        // ALWAYS generate fresh refresh token
        user.refreshToken = generateRefreshToken(user._id);

        await user.save();

        return done(null, {
          id: user._id,
          roles: user.roles,
        });
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);
export default passport;
