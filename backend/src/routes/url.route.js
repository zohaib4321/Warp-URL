
import Router from "express"
import { generateShortUrl, redirectToOriginalUrl } from "../controllers/url.controller.js"

const router = Router()

router.route("/short_url").post(generateShortUrl)
router.route("/").get(redirectToOriginalUrl)

export default router
