import { server } from "@/test/mock-service-worker/server"
import { http, HttpResponse } from "msw"
import { expect } from "vitest"
import { describeTestCase } from "@/test/setup/describe-test-case"

describeTestCase(
  "External Service Dependency Integration Tests",
  (appFactory) => {
    test("should return user profile when authenticated", async () => {
      const mockedResponse = { items: [{ name: "Item 1" }] }

      server.use(
        http.get("https://localhost:8080/api/posts", () =>
          HttpResponse.json(mockedResponse),
        ),
      )
      const response = await appFactory.request
        .get("/api/external/items")
        .expect(200)

      expect(response.body).toEqual(mockedResponse)
    })
  },
)
