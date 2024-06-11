import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (req, res, err, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 
    error instanceof mongoose.Error ? 400 : 500

    const message = error.message || "Something went wrong"

    throw new ApiError(statusCode, message, error?.errors || [], error.stack)
  }

  const response = {
    ...error,
    message: error.message
  }

  return res.status(error.statusCode).json(response)
}
