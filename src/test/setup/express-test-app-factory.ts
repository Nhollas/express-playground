import { MongoClient, Db } from "mongodb"
import supertest from "supertest"
import ExpressAppFactory from "@/server/express-app-factory"
import { MockAuthenticationService } from "../mocks/mock-authentication-service"
import { MongoMemoryServer } from "mongodb-memory-server"

class ExpressTestAppFactory {
  private mongoClient: MongoClient
  public httpClient: ReturnType<typeof supertest>
  public mockAuthService: MockAuthenticationService

  constructor() {
    this.mongoClient = null!
    this.httpClient = null!
    this.mockAuthService = new MockAuthenticationService()
  }

  async initialize() {
    const mongoServer = await MongoMemoryServer.create()

    this.mongoClient = new MongoClient(mongoServer.getUri())

    const expressApp = ExpressAppFactory.create({
      dbClient: this.mongoClient,
      authService: this.mockAuthService,
    })

    this.httpClient = supertest(expressApp)
  }

  getDb(): Db {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized. Call initialize() first")
    }

    return this.mongoClient.db()
  }

  async resetDatabase() {
    const db = this.getDb()
    const collections = await db.listCollections().toArray()

    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({})
    }
  }
}

export default ExpressTestAppFactory
