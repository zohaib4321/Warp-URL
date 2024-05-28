
import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// routes imports
import urlRouter from "./routes/url.route.js"

// routes declaration
app.use("/api/v1/url", urlRouter)

export { app }