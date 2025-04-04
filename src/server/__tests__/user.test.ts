import { expect } from "vitest"
import ExpressTestAppFactory from "@/test/setup/express-test-app-factory"

describe("User Integration Tests", () => {
  const testAppFactory = new ExpressTestAppFactory()

  beforeAll(async () => {
    await testAppFactory.initialize()
  })

  afterEach(async () => {
    await testAppFactory.resetDatabase()
  })

  test("should return user", async () => {
    const response = await testAppFactory.httpClient
      .get("/api/user")
      .expect(200)

    expect(response.body).toEqual({
      email: "test@test.com",
      id: "test-user-id",
      username: "testuser",
    })
  })

  test("should return modified user", async () => {
    testAppFactory.mockAuthService.setUser({
      id: "mock-test-user-id",
      username: "mocktestuser",
      email: "mockemail@test.com",
    })

    const response = await testAppFactory.httpClient
      .get("/api/user")
      .expect(200)

    expect(response.body).toEqual({
      email: "mockemail@test.com",
      id: "mock-test-user-id",
      username: "mocktestuser",
    })
  })
})
