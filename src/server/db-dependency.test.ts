import TestAppFactory from "@/test/setup/test-app-factory"
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"

describe("DB Dependency Integration Tests", () => {
  let factory: TestAppFactory

  beforeAll(async () => {
    factory = new TestAppFactory()
    await factory.initialize()
  })

  afterAll(async () => {
    await factory.dispose()
  })

  beforeEach(async () => {
    await factory.reset()
  })

  it("should return user profile when authenticated", async () => {
    const db = factory.getDb()
    const item = { name: "Item 1" }

    await db.collection("items").insertOne(item)

    const response = await factory.request.get("/api/db/items").expect(200)

    expect(response.body).toEqual({ items: [{ name: item.name }] })
  })
})
