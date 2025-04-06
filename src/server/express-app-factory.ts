import { MongoClient } from "mongodb"
import express from "express"
import type { Express } from "express"
import { authMiddleware } from "./middleware/auth"
import { IAuthenticationService } from "./services/auth-service"
import { getUserHandler } from "./handlers/user-handlers"
import {
  getItemsFromDbHandler,
  getItemsFromServiceHandler,
} from "./handlers/item-handlers"

interface ExpressAppFactoryArgs {
  dbClient: MongoClient
  authService: IAuthenticationService
}

class ExpressAppFactory {
  static create({ dbClient, authService }: ExpressAppFactoryArgs): Express {
    const app = express()

    app.use(express.json())

    app.use(authMiddleware(authService))

    app.get("/api/db/items", getItemsFromDbHandler(dbClient))
    app.get("/api/external/items", getItemsFromServiceHandler())
    app.get("/api/user", getUserHandler(authService))

    return app
  }
}

export default ExpressAppFactory
