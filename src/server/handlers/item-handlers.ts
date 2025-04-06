import { Request, Response } from "express"
import { MongoClient } from "mongodb"

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

export const getItemsFromServiceHandler = () => {
  return async (req: Request, res: Response) => {
    const response = await fetch("https://localhost:8080/api/posts")
    const data = await response.json()

    res.status(200).json(data)
  }
}
