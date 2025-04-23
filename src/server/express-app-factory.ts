import { MongoClient } from "mongodb"
import express from "express"
import type { Express } from "express"
import { authMiddleware } from "./middleware/auth"
import { IAuthenticationService } from "./services/auth-service"
import { getUserHandler } from "./handlers/user-handlers"
import { configureItemRoutes } from "./routes/item.routes"

interface ExpressAppFactoryArgs {
  dbClient: MongoClient
  authService: IAuthenticationService
}

class ExpressAppFactory {
  static create({ dbClient, authService }: ExpressAppFactoryArgs): Express {
    const app = express()

    app.use(express.json())

    app.use(authMiddleware(authService))

    app.use("/api/items", configureItemRoutes(dbClient, authService))
    app.get("/api/user", getUserHandler(authService))

    return app
  }
}

export default ExpressAppFactory
