import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/auth/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
	sendEmail,
	emailVerificationMailgenContent,
	forgotPasswordMailgenContent,
} from "../../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);

		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;

		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Something went wrong while generating the access and refresh tokens"
		);
	}
};

const registerUser = asyncHandler(async (req, res) => {
	const { username, fullName, email, password } = req.body;

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new ApiError(409, "User with email or username already exists", []);
	}
	const user = await User.create({
		username,
		fullName,
		email,
		password,
		isEmailVerified: false,
	});

	const { unHashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();

	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpiry = tokenExpiry;
	await user.save({ validateBeforeSave: false });

	await sendEmail({
		email: user?.email,
		subject: "Please verify your email",
		mailgenContent: emailVerificationMailgenContent(
			user.fullName,
			`${req.protocol}://${req.get(
				"host"
			)}/api/v1/users/verify-email/${unHashedToken}`
		),
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
	);

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(
				200,
				{ user: createdUser },
				"User registered successfully and verification email has been sent on your email."
			)
		);
});

const loginUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!username && !email) {
		throw new ApiError(400, "Username or email is required");
	}

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (!user) {
		throw new ApiError(404, "User does not exist");
	}

	const isPasswordvalid = await user.isPasswordCorrect(password);

	if (!isPasswordvalid) {
		throw new ApiError(404, "Invalid user credentials");
	}

	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
		user._id
	);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken -emailVerificationToken, -forgotPasswordToken"
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{ user: loggedInUser, accessToken, refreshToken },
				"User logged in successfully"
			)
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: "",
			},
		},
		{ new: true }
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request");
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			throw new ApiError(401, "Invalid refresh token");
		}

		if (incomingRefreshToken !== user.refreshToken) {
			throw new ApiError(401, "Refresh token is expired or used");
		}

		const options = {
			httpOnly: true,
			secure: true,
		};

		const { accessToken, refreshToken: newRefreshToken } =
			generateAccessAndRefreshTokens(user._id);

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{ accessToken, refreshToken: newRefreshToken },
					"Access token refreshed successfully"
				)
			);
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid refresh token");
	}
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	const user = await User.findOne(req.user?._id);

	const isPasswordvalid = user.isPasswordCorrect(oldPassword);

	if (!isPasswordvalid) {
		throw new ApiError(400, "Invalid old password");
	}

	user.password = newPassword;

	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password changed successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
	const { verificationToken } = req.params;

	if (!verificationToken) {
		throw new ApiError(400, "Email verification token is missing");
	}

	// generate a hash from the token that we are receiving
	const hashedToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	const user = await User.findOne({
		emailVerificationToken: hashedToken,
		emailVerificationExpiry: { $gt: Date.now() },
	});

	if (!user) {
		throw new ApiError(489, "Token is invalid or expired");
	}

	user.emailVerificationToken = undefined;
	user.emailVerificationExpiry = undefined;

	user.isEmailVerified = true;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user?._id);

	if (!user) {
		throw new ApiError(404, "User does not exists");
	}

	// check for email is already verified or not
	if (user.isEmailVerified) {
		throw new ApiError(409, "Email is already verified");
	}

	const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpiry = tokenExpiry;

	await user.save({ validateBeforeSave: false });

	await sendEmail({
		email: user?.email,
		subject: "Please verify your email",
		mailgenContent: emailVerificationMailgenContent(
			user?.fullName,
			`${req.protocol}://${req.get(
				"host"
			)}/api/v1/users/verify-email/${unHashedToken}`
		),
	});

	return res
		.status(200)
		.json(
			new ApiResponse(200, {}, "Email verification has been sent to your mail")
		);
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw new ApiError(404, "User does not exists");
	}

	const { unHashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();

	user.forgotPasswordToken = hashedToken;
	user.forgotPasswordExpiry = tokenExpiry;

	await user.save({ validateBeforeSave: false });

	await sendEmail({
		email: user?.email,
		subject: "Password reset request",
		mailgenContent: forgotPasswordMailgenContent(
			user?.fullName,
			`${req.protocol}://${req.get(
				"host"
			)}/api/v1/users/reset-password/${unHashedToken}`
		),
	});

	return res
		.status(200)
		.json(
			new ApiResponse(200, {}, "Password reset mail has been sent on your mail")
		);
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
	const { resetToken } = req.params;
	const { newPassword } = req.body;

	const hashedToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	const user = await User.findOne({
		forgotPasswordToken: hashedToken,
		forgotPasswordExpiry: { $gt: Date.now() },
	});

	if (!user) {
		throw new ApiError(489, "Token is invalid or expired");
	}

	user.forgotPasswordToken = undefined;
	user.forgotPasswordExpiry = undefined;

	user.password = newPassword;
	user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password reset successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
	return res
		.status(200)
		.json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getCurrentUser,
	changeCurrentPassword,
	verifyEmail,
	resendEmailVerification,
	forgotPasswordRequest,
	resetForgottenPassword,
};
