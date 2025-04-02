import { MongoClient } from "mongodb"
import AppFactory from "./app-factory"
import env from "./lib/env"

const dbClient = new MongoClient(env.MONGODB_URL)
const app = AppFactory.create(dbClient)

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
})
