import session from "express-session";

export function getSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || "dev_secret", // set env var in prod
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
}
