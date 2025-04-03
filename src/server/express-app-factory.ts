import { MongoClient } from "mongodb"
import express from "express"
import type { Express } from "express"

class ExpressAppFactory {
  static create(dbClient: MongoClient): Express {
    const app = express()

    app.use(express.json())

    app.get("/api/db/items", async (req, res) => {
      const items = await dbClient
        .db("test")
        .collection("items")
        .find()
        .toArray()

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
}

export default ExpressAppFactory
