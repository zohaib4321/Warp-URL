import { Router } from "express";
import {
	generateShortUrl,
	redirectToOriginalUrl,
} from "../../controllers/app/url.controller.js";

const router = Router();

router.route("/short_url").post(generateShortUrl);
router.route("/:urlCode").get(redirectToOriginalUrl);

export default router;
