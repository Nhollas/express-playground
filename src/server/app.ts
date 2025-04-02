import { MongoClient } from "mongodb"
import PartnerHubApiFactory from "./partner-hub-api-factory"
import env from "./lib/env"

const dbClient = new MongoClient(env.MONGODB_URL)
const app = PartnerHubApiFactory.create(dbClient)

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
})
