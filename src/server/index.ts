import express from "express"
import env from "./lib/env"

console.log("NODE_ENV", env)

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
  res.send("hi")
})
app.get("/api", (req, res) => {
  res.json({ message: "Hello from API!" })
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
