// passportConfig.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../../auth/models/User";
import { generateRefreshToken } from "../../auth/utils/genRefreshToken";
import { generateAccessToken } from "../../auth/utils/genAccessToken";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK = process.env.GOOGLE_CALLBACK!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account must have email"));

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            firstname: profile.name?.familyName || "",
            lastname: profile.name?.givenName || "",
            email,
            provider: ["google"],
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value || null,
          });
        } else {
          // link google account if needed
          if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.provider.includes("google")) {
              user.provider.push("google");
            }
            await user.save();
          }
        }

        const accessToken = generateAccessToken(user._id, user.roles);

        done(null, { id: user._id, accessToken });
      } catch (error) {
        done(error, false);
      }
    },
  ),
);

// Store ONLY user ID + access token
passport.serializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

// Attach roles + user to req.user
passport.deserializeUser(async (sessionUser: any, done) => {
  try {
    const user = await User.findById(sessionUser.id).lean();
    if (!user) return done(new Error("User not found"), false);

    done(null, {
      id: user._id,
      roles: Object.values(user.roles),
      accessToken: sessionUser.accessToken,
    });
  } catch (error) {
    done(error, false);
  }
});

export default passport;
