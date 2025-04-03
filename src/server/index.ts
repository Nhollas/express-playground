import { MongoClient } from "mongodb"
import ExpressAppFactory from "./express-app-factory"
import env from "./lib/env"

const dbClient = new MongoClient(env.MONGODB_URL)
const app = ExpressAppFactory.create(dbClient)

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
})
