import mongoose, { Schema } from "mongoose";

const urlSchema = new Schema(
	{
		urlCode: {
			type: String,
			unique: true,
		},
		originalUrl: {
			type: String,
			required: true,
			unique: true
		},
		// baseUrl/urlCode bit.ly/utydfwgc
		shortUrl: {
			type: String,
			required: true,
			unique: true,
			minlength: 6,
		},
		visits: {
			type: Number,
			default: 0,
		},
		expiresIn: {
			type: Date,
		},
	},
	{ timestamps: true }
);

export const Url = mongoose.model("Url", urlSchema);

