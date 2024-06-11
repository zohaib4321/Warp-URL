import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
	cors({
		origin:
			process.env.CORS_ORIGIN === "*"
				? "*"
				: process.env.CORS_ORIGIN?.split(","), // for multiple cors origins
		credentials: true,
	})
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes imports
import userRouter from "./routes/auth/user.route.js";
import urlRouter from "./routes/app/url.route.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/url", urlRouter);

// common error handling middleware
// app.use(errorHandler);

export { app };
