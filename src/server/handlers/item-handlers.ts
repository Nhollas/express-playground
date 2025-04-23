import { MongoClient } from "mongodb"
import { createRouteHandler } from "./create-route-handler"
import { z } from "zod"
import { IAuthenticationService } from "../services/auth-service"
import { Item } from "../types"

/**
 * GET /api/db/items
 *
 * Retrieves all items from the database.
 *
 * @param dbClient MongoDB client instance
 * @param authService Authentication service instance
 * @returns Express route handler
 */
export const getItemsHandler = (
  dbClient: MongoClient,
  authService: IAuthenticationService,
) =>
  createRouteHandler()
    .authorize(authService)
    .handle(async ({ res, user }) => {
      const items = await dbClient
        .db("test")
        .collection("items")
        .find({
          userId: user.id,
        })
        .toArray()

      res.status(200).json({
        items,
      })
    })

/**
 * POST /api/items
 *
 * Creates a new item in the database.
 *
 * @param dbClient MongoDB client instance
 * @param authService Authentication service instance
 * @returns Express route handler with validation
 */
export const createItemHandler = (
  dbClient: MongoClient,
  authService: IAuthenticationService,
) =>
  createRouteHandler()
    .validateBody(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
      }),
    )
    .authorize(authService)
    .handle(async ({ res, data: { body }, user }) => {
      const item: Omit<Item, "id"> = {
        createdAt: new Date(),
        userId: user.id,
        ...body,
      }

      await dbClient.db("test").collection("items").insertOne(item)

      res.status(201).json({
        item,
      })
    })
