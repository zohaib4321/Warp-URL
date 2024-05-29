import mongoose, { Schema } from "mongoose";

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
			trim: true,
		},
		phoneNumber: {
			type: Number,
			required: true,
		},
		password: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema)
