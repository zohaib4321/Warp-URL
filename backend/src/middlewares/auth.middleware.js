import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/auth/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
	const token =
		req.cookies?.accessToken ||
		req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		throw new ApiError(401, "Unauthorized request");
	}

	try {
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
		);
		if (!user) {
			throw new ApiError(401, "Invalid access token");
		}
		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid access token");
	}
});

export const getLoggedInUserOrIgnore = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    req.user = user;
    next();
  } catch (error) {
    // Fail silently with req.user being falsy
    next();
  }
});