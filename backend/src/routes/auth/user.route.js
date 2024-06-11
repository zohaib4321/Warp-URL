import { Router } from "express";
import {
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
} from "../../controllers/auth/user.controller.js";
import {
	userLoginValidator,
	userRegisterValidator,
	userForgotPasswordValidator,
	userChangeCurrentPasswordValidator,
	userResetForgottenPasswordValidator,
} from "../../validators/auth/user.validator.js";
import { validate } from "../../validators/validate.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
	.route("/forgot-password")
	.post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
	.route("/reset-password/:resetToken")
	.post(
		userResetForgottenPasswordValidator(),
		validate,
		resetForgottenPassword
	);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
	.route("/change-password")
	.post(
		verifyJWT,
		userChangeCurrentPasswordValidator(),
		validate,
		changeCurrentPassword
	);
router
	.route("/resend-email-verification")
	.post(verifyJWT, resendEmailVerification);

export default router;
