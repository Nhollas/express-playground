import { MongoClient, Db } from "mongodb"
import supertest from "supertest"
import ExpressAppFactory from "@/server/express-app-factory"
import { inject } from "vitest"

class ExpressTestAppFactory {
  private mongoClient: MongoClient | null
  public httpClient: ReturnType<typeof supertest>

  constructor() {
    this.mongoClient = null
    this.httpClient = null!
  }

  initialize() {
    const mongoUri = inject("mongoUri")
    this.mongoClient = new MongoClient(mongoUri)

    const expressApp = ExpressAppFactory.create(this.mongoClient)
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
