import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ProblemDetails } from "../lib/problem-details"

interface RouterContext<B = unknown, Q = unknown, P = unknown> {
  req: Request
  res: Response
  next: NextFunction
  data: {
    body: B
    query: Q
    params: P
  }
}

type HandlerFunction<B = unknown, Q = unknown, P = unknown> = (
  context: RouterContext<B, Q, P>,
) => Promise<void> | void

class RouterHandler<B = unknown, Q = unknown, P = unknown> {
  private bodySchema?: z.ZodType<B>
  private querySchema?: z.ZodType<Q>
  private paramsSchema?: z.ZodType<P>

  validateBody<NewB>(schema: z.ZodType<NewB>): RouterHandler<NewB, Q, P> {
    const handler = new RouterHandler<NewB, Q, P>()
    handler.bodySchema = schema
    handler.querySchema = this.querySchema
    handler.paramsSchema = this.paramsSchema
    return handler
  }

  validateQuery<NewQ>(schema: z.ZodType<NewQ>): RouterHandler<B, NewQ, P> {
    const handler = new RouterHandler<B, NewQ, P>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = schema
    handler.paramsSchema = this.paramsSchema
    return handler
  }

  validateParams<NewP>(schema: z.ZodType<NewP>): RouterHandler<B, Q, NewP> {
    const handler = new RouterHandler<B, Q, NewP>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = this.querySchema
    handler.paramsSchema = schema
    return handler
  }

  handle(
    fn: HandlerFunction<B, Q, P>,
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        let body: B = {} as B
        let query: Q = {} as Q
        let params: P = {} as P

        // Validate body
        if (this.bodySchema) {
          if (
            req.body == null ||
            (typeof req.body === "object" && Object.keys(req.body).length === 0)
          ) {
            res.status(422).json(
              ProblemDetails.create({
                type: "https://example.com/probs/validation",
                title: "Your request body didn't validate.",
                status: 422,
                detail: "Request body is required",
              }),
            )
            return
          }
          try {
            body = this.bodySchema.parse(req.body)
          } catch (error) {
            if (error instanceof z.ZodError) {
              console.log("bodyerror", error.errors)
              res.status(422).json(
                ProblemDetails.create({
                  type: "https://example.com/probs/validation",
                  title: "Your request body didn't validate.",
                  status: 422,
                  "invalid-body": error.errors.map((e) => ({
                    property: e.path.join("."),
                    message: e.message,
                  })),
                }),
              )
              return
            }
            throw error
          }
        }

        // Validate query
        if (this.querySchema) {
          try {
            query = this.querySchema.parse(req.query)
          } catch (error) {
            if (error instanceof z.ZodError) {
              res.status(400).json(
                ProblemDetails.create({
                  type: "https://example.com/probs/validation",
                  title: "Your request queries didn't validate.",
                  status: 400,
                  "invalid-queries": error.errors.map((e) => ({
                    property: e.path.join("."),
                    message: e.message,
                  })),
                }),
              )

              return
            }
            throw error
          }
        }

        // Validate params
        if (this.paramsSchema) {
          try {
            params = this.paramsSchema.parse(req.params)
          } catch (error) {
            if (error instanceof z.ZodError) {
              res.status(400).json(
                ProblemDetails.create({
                  type: "https://example.com/probs/validation",
                  title: "Your request parameters didn't validate.",
                  status: 400,
                  "invalid-params": error.errors.map((e) => ({
                    property: e.path.join("."),
                    message: e.message,
                  })),
                }),
              )

              return
            }
            throw error
          }
        }

        await fn({
          req,
          res,
          next,
          data: { body, query, params },
        })
      } catch (error) {
        next(error)
      }
    }
  }
}

export function createRouteHandler(): RouterHandler {
  return new RouterHandler()
}
