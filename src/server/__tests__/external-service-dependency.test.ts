import { server } from "@/test/mock-service-worker/server"
import { http, HttpResponse } from "msw"
import { expect } from "vitest"
import ExpressTestAppFactory from "@/test/setup/express-test-app-factory"

describe("External Service Dependency Integration Tests", () => {
  const appFactory = new ExpressTestAppFactory()

  beforeAll(async () => {
    appFactory.initialize()
  })

  beforeEach(async () => {
    await appFactory.resetDatabase()
  })

  test("should return user profile when authenticated", async () => {
    const mockedResponse = { items: [{ name: "Item 1" }] }

    server.use(
      http.get("https://localhost:8080/api/posts", () =>
        HttpResponse.json(mockedResponse),
      ),
    )
    const response = await appFactory.httpClient
      .get("/api/external/items")
      .expect(200)

    expect(response.body).toEqual(mockedResponse)
  })
})
