import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient, Db } from "mongodb"
import supertest from "supertest"
import { createApp } from "@/server/app"

class PartnerHubApiFactory {
  private mongoServer: MongoMemoryServer
  private mongoClient: MongoClient | null
  public request: ReturnType<typeof supertest>

  constructor() {
    this.mongoServer = new MongoMemoryServer()
    this.mongoClient = null
    this.request = null!
  }

  async initialize() {
    await this.mongoServer.start()
    const mongoUri = this.mongoServer.getUri()

    this.mongoClient = new MongoClient(mongoUri)
    await this.mongoClient.connect()

    const expressApp = await createApp(this.mongoClient)
    this.request = supertest(expressApp)
  }

  getDb(): Db {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized. Call initialize() first")
    }
    return this.mongoClient.db()
  }

  async reset() {
    const db = this.getDb()
    const collections = await db.listCollections().toArray()

    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({})
    }
  }

  async dispose() {
    if (this.mongoClient) {
      await this.mongoClient.close()
    }

    if (this.mongoServer) {
      await this.mongoServer.stop()
    }
  }
}

export default PartnerHubApiFactory
