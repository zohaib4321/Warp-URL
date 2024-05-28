import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
  path: "./env"
})

connectDB()

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
})