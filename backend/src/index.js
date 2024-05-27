import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
  path: "./env"
})

connectDB()

const app = express()

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
})