import { server } from "@/test/mock-service-worker/server"

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
