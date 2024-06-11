import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async (options) => {
	const mailGenerator = new Mailgen({
		theme: "default",
		product: {
			name: "WarpURL",
			link: "https://warpurl.service.org",
		},
	});

	const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

	const emailHtml = mailGenerator.generate(options.mailgenContent);

	const transporter = nodemailer.createTransport({
		host: process.env.MAILTRAP_SMTP_HOST,
		port: process.env.MAILTRAP_SMTP_PORT,
		auth: {
			user: process.env.MAILTRAP_SMTP_USER,
			pass: process.env.MAILTRAP_SMTP_PASS,
		},
	});

	const mail = {
		from: "mail.warpurl.service@gmail.com",
		to: options.email,
		subject: options.subject,
		text: emailTextual,
		html: emailHtml,
	};

	try {
		await transporter.sendMail(mail);
	} catch (error) {
		console.log(
			"Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
		);
		console.log("Error: ", error);
	}
};

const emailVerificationMailgenContent = (fullName, verificationUrl) => {
	return {
		body: {
			name: fullName,
			intro: "Welcome to our app! We're very excited to have you on board.",
			action: {
				instructions:
					"To verify your email please click on the following button:",
				button: {
					color: "#22BC66",
					text: "Verify your email",
					link: verificationUrl,
				},
			},
			outro:
				"Need help, or have questions? Just reply to this email, we'd love to help.",
		},
	};
};

const forgotPasswordMailgenContent = (fullName, passwordResetUrl) => {
	return {
		body: {
			name: fullName,
			intro: "We got a request to reset the password of your account",
			action: {
				instructions:
					"To reset your password please click on the following button:",
				button: {
					color: "#22BC66",
					text: "Reset your password",
					link: passwordResetUrl,
				},
			},
			outro:
				"Need help, or have questions? Just reply to this email, we'd love to help.",
		},
	};
};

export {
	sendEmail,
	emailVerificationMailgenContent,
	forgotPasswordMailgenContent,
};
