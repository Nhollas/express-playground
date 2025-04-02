import "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { server } from "@/test/mock-service-worker/server"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
