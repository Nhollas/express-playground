import { Request, Response, NextFunction } from "express"
import { z } from "zod"

interface RouterContext<B = unknown, Q = unknown> {
  req: Request
  res: Response
  next: NextFunction
  data: {
    body: B
    query: Q
  }
}

type HandlerFunction<B = unknown, Q = unknown> = (
  context: RouterContext<B, Q>,
) => Promise<void> | void

class RouterHandler<B = unknown, Q = unknown> {
  private bodySchema?: z.ZodType<B>
  private querySchema?: z.ZodType<Q>

  validateBody<NewB>(schema: z.ZodType<NewB>): RouterHandler<NewB, Q> {
    const handler = new RouterHandler<NewB, Q>()
    handler.bodySchema = schema
    handler.querySchema = this.querySchema
    return handler
  }

  validateQuery<NewQ>(schema: z.ZodType<NewQ>): RouterHandler<B, NewQ> {
    const handler = new RouterHandler<B, NewQ>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = schema
    return handler
  }

  handle(fn: HandlerFunction<B, Q>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = {
          body: this.bodySchema ? this.bodySchema.parse(req.body) : ({} as B),
          query: this.querySchema
            ? this.querySchema.parse(req.query)
            : ({} as Q),
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
