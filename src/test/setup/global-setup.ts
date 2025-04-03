import { MongoMemoryServer } from "mongodb-memory-server"
import type { TestProject } from "vitest/node"

let mongoServer: MongoMemoryServer = null!

async function setup(project: TestProject) {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  project.provide("mongoUri", mongoUri)
}

async function teardown() {
  if (mongoServer) {
    await mongoServer.stop()
  }
}

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string
  }
}

export { setup, teardown }
