import { expect } from "vitest"
import { describeTestCase } from "@/test/setup/describe-test-case"
import crypto from "crypto"

describeTestCase("DB Dependency Integration Tests", (appFactory) => {
  test("should return items from the database 1", async () => {
    const db = appFactory.getDb()
    const item = { name: `Item ${crypto.randomUUID()}` }

    await db.collection("items").insertOne(item)

    const response = await appFactory.request.get("/api/db/items").expect(200)

    expect(response.body).toEqual({ items: [{ name: item.name }] })
  })

  test("should return items from the database 2", async () => {
    const db = appFactory.getDb()
    const items = Array.from({ length: 5 }, () => ({
      name: `Item ${crypto.randomUUID()}`,
    }))

    await db.collection("items").insertMany(items)

    const response = await appFactory.request.get("/api/db/items").expect(200)

    expect(response.body).toEqual({
      items: items.map((item) => ({ name: item.name })),
    })
  })

  test("should return items from the database 3", async () => {
    const db = appFactory.getDb()
    const items = Array.from({ length: 10 }, () => ({
      name: `Item ${crypto.randomUUID()}`,
    }))

    await db.collection("items").insertMany(items)

    const response = await appFactory.request.get("/api/db/items").expect(200)

    expect(response.body).toEqual({
      items: items.map((item) => ({ name: item.name })),
    })
  })
})
