import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { USER_TEMPORARY_TOKEN_EXPIRY } from "../../constants.js"

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		refreshToken: {
			type: String,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		forgotPasswordToken: {
			type: String,
		},
		forgotPasswordExpiry: {
			type: Date,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpiry: {
			type: Date,
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcryptjs.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};

// Method responsible for generating tokens for email verification, password reset etc.

userSchema.methods.generateTemporaryToken = function () {
	// This token should be client facing
 	// for example: for email verification unHashedToken should go into the user's mail

  const unHashedToken = crypto.randomBytes(20).toString("hex");

// 	// This should stay in the DB to compare at the time of verification
	const hashedToken = crypto
	.createHash("sha256")
	.update(unHashedToken)
	.digest("hex");

// 	// This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

	return { hashedToken, unHashedToken, tokenExpiry }
};

export const User = mongoose.model("User", userSchema);
