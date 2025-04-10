import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { createRouteHandler } from "../create-route-handler"
import { describe, it, expect, beforeEach, vi } from "vitest"

const mockRequest = (body = {}, query = {}) =>
  ({
    body,
    query,
  }) as Request

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockNext = vi.fn() as NextFunction

describe("createRouteHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a route handler", () => {
    const handler = createRouteHandler()
    expect(handler).toBeDefined()
  })

  describe("body validation", () => {
    it("should validate request body", async () => {
      const bodySchema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const handler = createRouteHandler()
        .validateBody(bodySchema)
        .handle(({ data }) => {
          expect(data.body).toEqual({ name: "John", age: 30 })
        })

      const req = mockRequest({ name: "John", age: 30 })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return validation error for invalid body", async () => {
      const bodySchema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const handler = createRouteHandler()
        .validateBody(bodySchema)
        .handle(() => {})

      const req = mockRequest({ name: "John", age: "30" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Validation Error",
        }),
      )
    })
  })

  describe("query validation", () => {
    it("should validate request query", async () => {
      const querySchema = z.object({
        page: z.string(),
        limit: z.string(),
      })

      const handler = createRouteHandler()
        .validateQuery(querySchema)
        .handle(({ data }) => {
          expect(data.query).toEqual({ page: "1", limit: "10" })
        })

      const req = mockRequest({}, { page: "1", limit: "10" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return validation error for invalid query", async () => {
      const querySchema = z.object({
        page: z.number(),
      })

      const handler = createRouteHandler()
        .validateQuery(querySchema)
        .handle(() => {})

      const req = mockRequest({}, { page: "one" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Validation Error",
        }),
      )
    })
  })

  describe("combined validation", () => {
    it("should validate both body and query parameters", async () => {
      const bodySchema = z.object({
        name: z.string(),
      })

      const querySchema = z.object({
        id: z.string(),
      })

      const handler = createRouteHandler()
        .validateBody(bodySchema)
        .validateQuery(querySchema)
        .handle(({ data }) => {
          expect(data.body).toEqual({ name: "John" })
          expect(data.query).toEqual({ id: "123" })
        })

      const req = mockRequest({ name: "John" }, { id: "123" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("error handling", () => {
    it("should pass non-validation errors to next function", async () => {
      const error = new Error("Test error")

      const handler = createRouteHandler().handle(() => {
        throw error
      })

      const req = mockRequest()
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe("handler execution", () => {
    it("should execute the handler function with correct context", async () => {
      const handlerFn = vi.fn()

      const handler = createRouteHandler().handle(handlerFn)

      const req = mockRequest({ test: "data" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(handlerFn).toHaveBeenCalledWith(
        expect.objectContaining({
          req,
          res,
          next: mockNext,
          data: expect.objectContaining({
            body: expect.any(Object),
            query: expect.any(Object),
          }),
        }),
      )
    })

    it("should handle async handler functions", async () => {
      let flag = false

      const handler = createRouteHandler().handle(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        flag = true
      })

      const req = mockRequest()
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(flag).toBe(true)
    })
  })
})
