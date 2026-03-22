// sessionConfig.ts
import session from "express-session";
import MongoStore from "connect-mongo";


export const sessionConfig = () =>
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    rolling: true, // refresh cookie age on each request
    name: "sessionGoogleCookie",

    store: process.env.NODE_ENV === "test" ? undefined : MongoStore.create({
      mongoUrl: process.env.DB_URL,     
      collectionName: "sessions",
      ttl: 24 * 60 * 60,           
      autoRemove: "native"
    }),

    cookie: {
      maxAge: 1000 * 60 * 60 * 24,      // 1 day
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  });
