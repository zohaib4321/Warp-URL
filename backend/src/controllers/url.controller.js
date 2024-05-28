import { asyncHandler } from "../utils/asyncHandler.js"
import Url from "../models/url.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const generateShortUrl = async (req, res) => {
  const { originalUrl } = req.body;

  console.log(originalUrl);
}


export {
  generateShortUrl
}