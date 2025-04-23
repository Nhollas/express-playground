import { Router } from "express"
import { MongoClient } from "mongodb"
import { IAuthenticationService } from "../services/auth-service"
import { createItemHandler, getItemsHandler } from "../handlers/item-handlers"

export function configureItemRoutes(
  dbClient: MongoClient,
  authService: IAuthenticationService,
) {
  const router = Router()

  router.get("/", getItemsHandler(dbClient, authService))
  router.post("/", createItemHandler(dbClient, authService))

  return router
}
