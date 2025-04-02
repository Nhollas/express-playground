import express from "express"
import env from "./lib/env"

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
  res.send(env.TELETRAAN_API_URL)
})
app.get("/api", (req, res) => {
  res.json({ message: "Hello from API!" })
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
