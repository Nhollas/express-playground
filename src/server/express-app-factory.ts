import { MongoClient } from "mongodb"
import express from "express"
import type { Express } from "express"
import { createAuthMiddleware } from "./middleware/auth"
import { IAuthenticationService } from "./services/auth-service"

interface ExpressAppFactoryArgs {
  dbClient: MongoClient
  authService: IAuthenticationService
}

class ExpressAppFactory {
  static create({ dbClient, authService }: ExpressAppFactoryArgs): Express {
    const app = express()

    app.use(express.json())

    const authMiddleware = createAuthMiddleware(authService)
    app.use(authMiddleware)

    app.get("/api/db/items", async (_, res) => {
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

    app.get("/api/user", (req, res) => {
      const user = authService.getUser(req)

      res.status(200).json(user)
    })

    return app
  }
}

export default ExpressAppFactory
