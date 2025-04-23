import { expect } from "vitest"
import ExpressTestAppFactory from "@/test/setup/express-test-app-factory"

describe("DB Dependency Integration Tests", () => {
  const testAppFactory = new ExpressTestAppFactory()

  beforeAll(async () => {
    await testAppFactory.initialize()
  })

  beforeEach(async () => {
    await testAppFactory.resetDatabase()
  })

  test("should return items from the database 1", async () => {
    const db = testAppFactory.getDb()
    const item = { name: `Item ${crypto.randomUUID()}` }

    await db.collection("items").insertOne(item)

    const response = await testAppFactory.httpClient
      .get("/api/db/items")
      .expect(200)

    expect(response.body).toEqual({ items: [{ name: item.name }] })
  })

  test("should return items from the database 2", async () => {
    const db = testAppFactory.getDb()
    const items = Array.from({ length: 5 }, () => ({
      name: `Item ${crypto.randomUUID()}`,
    }))

    await db.collection("items").insertMany(items)

    const response = await testAppFactory.httpClient
      .get("/api/db/items")
      .expect(200)

    expect(response.body).toEqual({
      items: items.map((item) => ({ name: item.name })),
    })
  })

  test("should return items from the database 3", async () => {
    const db = testAppFactory.getDb()
    const items = Array.from({ length: 10 }, () => ({
      name: `Item ${crypto.randomUUID()}`,
    }))

    await db.collection("items").insertMany(items)

    const response = await testAppFactory.httpClient
      .get("/api/db/items")
      .expect(200)

    expect(response.body).toEqual({
      items: items.map((item) => ({ name: item.name })),
    })
  })
})
