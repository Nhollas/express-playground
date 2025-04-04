import { server } from "@/test/mock-service-worker/server"
import { http, HttpResponse } from "msw"
import { expect } from "vitest"
import ExpressTestAppFactory from "@/test/setup/express-test-app-factory"

describe("External Service Dependency Integration Tests", () => {
  const testAppFactory = new ExpressTestAppFactory()

  beforeAll(async () => {
    await testAppFactory.initialize()
  })

  beforeEach(async () => {
    await testAppFactory.resetDatabase()
  })

  test("should return items from the external service 1", async () => {
    const mockedResponse = {
      items: Array.from({ length: 3 }, () => ({
        name: `Item ${crypto.randomUUID()}`,
      })),
    }

    server.use(
      http.get("https://localhost:8080/api/posts", () =>
        HttpResponse.json(mockedResponse),
      ),
    )
    const response = await testAppFactory.httpClient
      .get("/api/external/items")
      .expect(200)

    expect(response.body).toEqual(mockedResponse)
  })

  test("should return items from the external service 2", async () => {
    const mockedResponse = {
      items: Array.from({ length: 5 }, () => ({
        name: `Item ${crypto.randomUUID()}`,
      })),
    }

    server.use(
      http.get("https://localhost:8080/api/posts", () =>
        HttpResponse.json(mockedResponse),
      ),
    )
    const response = await testAppFactory.httpClient
      .get("/api/external/items")
      .expect(200)

    expect(response.body).toEqual(mockedResponse)
  })
})
