import pino from "pino";

export const logger = pino({
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : {
          target: "pino/file",
          options: {
            destination: "logs/app.log",
          },
        },
});
