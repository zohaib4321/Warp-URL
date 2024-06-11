import { body } from "express-validator";

const userRegisterValidator = () => {
	return [
		body("username")
			.trim()
			.notEmpty()
			.withMessage("Username is required")
			.isLowercase()
			.withMessage("Username must be lowercase")
			.isLength({ min: 3 })
			.withMessage("Username must be at lease 3 characters long"),
		body("fullName")
			.trim()
			.notEmpty()
			.withMessage("Full name is required")
			.isLength({ min: 3 })
			.withMessage("Full name must be at lease 3 characters long"),
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Email is invalid"),
		body("password").trim().notEmpty().withMessage("Password is required"),
	];
};

const userLoginValidator = () => {
	return [
		body("email").optional().isEmail().withMessage("Email is invalid"),
		body("username").optional(),
		body("password").trim().notEmpty().withMessage("Password is required"),
	];
};

const userChangeCurrentPasswordValidator = () => {
	return [
		body("oldPassword").notEmpty().withMessage("Old password is required"),
		body("newPassword").notEmpty().withMessage("New password is required"),
	];
};

const userForgotPasswordValidator = () => {
	return [
		body("email")
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Email is invalid"),
	];
};

const userResetForgottenPasswordValidator = () => {
	return [body("newPassword").notEmpty().withMessage("Password is required")];
};

export {
  userLoginValidator,
	userRegisterValidator,
	userForgotPasswordValidator,
	userChangeCurrentPasswordValidator,
	userResetForgottenPasswordValidator,
};
