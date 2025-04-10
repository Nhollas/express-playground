import { Request, Response } from "express"
import { MongoClient } from "mongodb"
import { createRouteHandler } from "./create-route-handler"
import { z } from "zod"

/**
 * GET /api/db/items
 *
 * Retrieves all items from the database.
 *
 * @param dbClient MongoDB client instance
 * @returns Express route handler
 */
export const getItemsFromDbHandler = (dbClient: MongoClient) => {
  return async (req: Request, res: Response) => {
    const items = await dbClient.db("test").collection("items").find().toArray()

    res.status(200).json({
      items: items.map((item) => ({
        name: item.name,
      })),
    })
  }
}

/**
 * GET /api/external/items
 *
 * Fetches items from an external service.
 *
 * @returns Express route handler
 */
export const getItemsFromServiceHandler = () => {
  return async (req: Request, res: Response) => {
    const response = await fetch("https://localhost:8080/api/posts")
    const data = await response.json()

    res.status(200).json(data)
  }
}

const createItemSchema = z.object({
  name: z.string(),
})

/**
 * POST /api/items
 *
 * Creates a new item in the database.
 *
 * @param dbClient MongoDB client instance
 * @returns Express route handler with validation
 */
export const createItemHandler = (dbClient: MongoClient) =>
  createRouteHandler()
    .validateBody(createItemSchema)
    .handle(async ({ res, data }) => {
      const item = data.body

      await dbClient.db("test").collection("items").insertOne(item)

      res.status(201).json({
        item,
      })
    })
