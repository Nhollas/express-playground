import express from "express"
import { MongoClient } from "mongodb"
import PartnerHubApiFactory from "./partner-hub-api-factory"
import env from "./lib/env"
// import env from "./lib/env"

export const createApp = async (dbClient: MongoClient) => {
  const app = express()

  app.use(express.json())

  app.get("/api/db/items", async (req, res) => {
    const items = await dbClient.db("test").collection("items").find().toArray()

    res.status(200).json({
      items: items.map((item) => ({
        name: item.name,
      })),
    })
  })

  app.get("/api/external/items", async (req, res) => {
    const response = await fetch("https://localhost:8080/api/posts")
    const data = await response.json()

    res.status(200).json(data)
  })

  return app
}

const dbClient = new MongoClient(env.MONGODB_URL)
const app = PartnerHubApiFactory.create(dbClient)

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
})

export default createApp
