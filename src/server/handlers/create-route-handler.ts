import { Request, Response, NextFunction } from "express"
import { z } from "zod"

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

  handle(fn: HandlerFunction<B, Q, P>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = {
          body: this.bodySchema ? this.bodySchema.parse(req.body) : ({} as B),
          query: this.querySchema
            ? this.querySchema.parse(req.query)
            : ({} as Q),
          params: this.paramsSchema
            ? this.paramsSchema.parse(req.params)
            : ({} as P),
        }

        await fn({
          req,
          res,
          next,
          data: validatedData,
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: "Validation Error",
            details: error.errors,
          })
        } else {
          next(error)
        }
      }
    }
  }
}

export function createRouteHandler(): RouterHandler {
  return new RouterHandler()
}
