import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { createRouteHandler } from "../create-route-handler"
import { describe, it, expect, beforeEach, vi } from "vitest"

const mockRequest = (body = {}, query = {}, params = {}) =>
  ({
    body,
    query,
    params,
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

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({
        type: "https://example.com/probs/validation",
        title: "Your request body didn't validate.",
        status: 422,
        "invalid-body": [
          {
            message: "Expected number, received string",
            property: "age",
          },
        ],
      })
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
      expect(res.json).toHaveBeenCalledWith({
        type: "https://example.com/probs/validation",
        title: "Your request queries didn't validate.",
        status: 400,
        "invalid-queries": [
          {
            message: "Expected number, received string",
            property: "page",
          },
        ],
      })
    })
  })

  describe("params validation", () => {
    it("should validate URL parameters", async () => {
      const paramsSchema = z.object({
        userId: z.string(),
        taskId: z.string(),
      })

      const handler = createRouteHandler()
        .validateParams(paramsSchema)
        .handle(({ data }) => {
          expect(data.params).toEqual({ userId: "123", taskId: "456" })
        })

      const req = mockRequest({}, {}, { userId: "123", taskId: "456" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return validation error for invalid params", async () => {
      const paramsSchema = z.object({
        userId: z.string().uuid(),
      })

      const handler = createRouteHandler()
        .validateParams(paramsSchema)
        .handle(() => {})

      const req = mockRequest({}, {}, { userId: "not-a-valid-uuid" })
      const res = mockResponse()

      await handler(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        type: "https://example.com/probs/validation",
        title: "Your request parameters didn't validate.",
        status: 400,
        "invalid-params": [
          {
            message: "Invalid uuid",
            property: "userId",
          },
        ],
      })
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

    it("should validate body, query, and params together", async () => {
      const bodySchema = z.object({
        name: z.string(),
      })

      const querySchema = z.object({
        sort: z.string(),
      })

      const paramsSchema = z.object({
        userId: z.string(),
      })

      const handler = createRouteHandler()
        .validateBody(bodySchema)
        .validateQuery(querySchema)
        .validateParams(paramsSchema)
        .handle(({ data }) => {
          expect(data.body).toEqual({ name: "John" })
          expect(data.query).toEqual({ sort: "desc" })
          expect(data.params).toEqual({ userId: "123" })
        })

      const req = mockRequest(
        { name: "John" },
        { sort: "desc" },
        { userId: "123" },
      )
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
            params: expect.any(Object),
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
