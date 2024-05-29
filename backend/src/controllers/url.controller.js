import { asyncHandler } from "../utils/asyncHandler.js";
import { Url } from "../models/url.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { baseUrl } from "../constants.js";

const generateUniqueIdentifier = () => {
	let base62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let urlCode = "";

	for (let i = 0; i < 7; i++) {
		const randomCode = Math.floor(Math.random() * base62.length + 1);
		urlCode += base62.charAt(randomCode);
	}

	return urlCode;
};

const generateShortUrl = asyncHandler(async (req, res) => {
	try {
		const { originalUrl, domain } = req.body;

		if (!originalUrl) {
			throw new ApiError(400, "URL is required");
		}

		if (
			!/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
				originalUrl
			)
		) {
			throw new ApiError(401, "Url is invalid");
		}

		const existedUrl = await Url.findOne({ originalUrl });

		if (!existedUrl) {
			const hashedCode = generateUniqueIdentifier();
			const url = `${domain ? domain : baseUrl}/${hashedCode}`;

			const generatedUrl = await Url.create({
				urlCode: hashedCode,
				originalUrl: originalUrl,
				shortUrl: url,
				visits: 0,
				expiresIn: Date.now() + 30 * 24 * 60 * 60 * 1000,
			});

			return res
				.status(200)
				.json(
					new ApiResponse(200, generatedUrl, "Short url generated successfully")
				);
		}

		return res
			.status(201)
			.json(new ApiResponse(201, existedUrl, "Url exists already"));
	} catch (error) {
		throw new ApiError(500, "Failed to generate short url");
	}
});

const redirectToOriginalUrl = asyncHandler(async (req, res) => {
	try {
		const shortUrl = req.query;

		console.log(shortUrl);

		const existedUrl = await Url.findOneAndUpdate(
			shortUrl,
			{
				$inc: {
					visits: 1,
				},
			},
			{
				new: true,
			}
		);

		console.log(existedUrl);
		return res
			.status(301)
			.redirect(existedUrl.originalUrl)
			.json(
				new ApiResponse(
					301,
					existedUrl.originalUrl,
					"User redirected successfully"
				)
			);
	} catch (error) {
		throw new ApiError(500, "Failed to redirect");
	}
});

export { generateShortUrl, redirectToOriginalUrl };
