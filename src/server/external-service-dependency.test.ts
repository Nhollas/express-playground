import { server } from "@/test/mock-service-worker/server"
import TestAppFactory from "@/test/setup/test-app-factory"
import { http, HttpResponse } from "msw"
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"

describe("External Service Dependency Integration Tests", () => {
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
    const mockedResponse = { items: [{ name: "Item 1" }] }

    server.use(
      http.get("https://localhost:8080/api/posts", () =>
        HttpResponse.json(mockedResponse),
      ),
    )

    const response = await factory.request
      .get("/api/external/items")
      .expect(200)

    expect(response.body).toEqual(mockedResponse)
  })
})
