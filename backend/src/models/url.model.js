import mongoose, { Schema } from "mongoose";

const urlSchema = new Schema(
	{
		originalUrl: {
			type: String,
			required: true,
			unique: true
		},
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

const Url = mongoose.model("Url", urlSchema);

export default Url
