import { MongoClient } from "mongodb"
import ExpressAppFactory from "./express-app-factory"
import env from "./lib/env"
import { AuthenticationService } from "./services/auth-service"

const dbClient = new MongoClient(env.MONGODB_URL)
const authService = new AuthenticationService()

const app = ExpressAppFactory.create({ dbClient, authService })

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
})
