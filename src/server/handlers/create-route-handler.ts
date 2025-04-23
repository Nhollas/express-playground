import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ProblemDetails } from "../lib/problem-details"
import { IAuthenticationService } from "../services/auth-service"
import type { UserSession } from "../types"

interface RouterContext<B = never, Q = never, P = never, U = never> {
  req: Request
  res: Response
  next: NextFunction
  data: {
    body: B
    query: Q
    params: P
  }
  user: U
}

type HandlerFunction<B = never, Q = never, P = never, U = never> = (
  context: RouterContext<B, Q, P, U>,
) => Promise<void> | void

class RouterHandler<B = never, Q = never, P = never, U = never> {
  private bodySchema?: z.ZodType<B>
  private querySchema?: z.ZodType<Q>
  private paramsSchema?: z.ZodType<P>
  private authService?: IAuthenticationService

  /**
   * Adds validation for the request body using a Zod schema.
   * Returns a new RouterHandler instance with the body type set.
   *
   * @example
   * createRouteHandler()
   *   .validateBody(z.object({ name: z.string() }))
   *   .handle(async ({ data }) => { ... })
   *
   * @param schema - Zod schema to validate the request body.
   * @returns A new RouterHandler instance with body validation.
   */
  validateBody<NewB>(schema: z.ZodType<NewB>): RouterHandler<NewB, Q, P, U> {
    const handler = new RouterHandler<NewB, Q, P, U>()
    handler.bodySchema = schema
    handler.querySchema = this.querySchema
    handler.paramsSchema = this.paramsSchema
    handler.authService = this.authService

    return handler
  }

  /**
   * Adds validation for the request query parameters using a Zod schema.
   * Returns a new RouterHandler instance with the query type set.
   *
   * @example
   * createRouteHandler()
   *   .validateQuery(z.object({ page: z.number() }))
   *   .handle(async ({ data }) => { ... })
   *
   * @param schema - Zod schema to validate the request query.
   * @returns A new RouterHandler instance with query validation.
   */
  validateQuery<NewQ>(schema: z.ZodType<NewQ>): RouterHandler<B, NewQ, P, U> {
    const handler = new RouterHandler<B, NewQ, P, U>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = schema
    handler.paramsSchema = this.paramsSchema
    handler.authService = this.authService

    return handler
  }

  /**
   * Adds validation for the request route parameters using a Zod schema.
   * Returns a new RouterHandler instance with the params type set.
   *
   * @example
   * createRouteHandler()
   *   .validateParams(z.object({ id: z.string().uuid() }))
   *   .handle(async ({ data }) => { ... })
   *
   * @param schema - Zod schema to validate the route parameters.
   * @returns A new RouterHandler instance with params validation.
   */
  validateParams<NewP>(schema: z.ZodType<NewP>): RouterHandler<B, Q, NewP, U> {
    const handler = new RouterHandler<B, Q, NewP, U>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = this.querySchema
    handler.paramsSchema = schema
    handler.authService = this.authService

    return handler
  }

  /**
   * Adds authorization to the route using the provided authentication service.
   * Ensures that the user is authenticated before proceeding.
   * Returns a new RouterHandler instance with the user type set.
   *
   * @example
   * createRouteHandler()
   *   .authorize(authService)
   *   .handle(async ({ user }) => { ... })
   *
   * @param authService - Service used to authenticate the user.
   * @returns A new RouterHandler instance with user authentication.
   */
  authorize(
    this: RouterHandler<B, Q, P, U>,
    authService: IAuthenticationService,
  ): RouterHandler<B, Q, P, UserSession> {
    const handler = new RouterHandler<B, Q, P, UserSession>()
    handler.bodySchema = this.bodySchema
    handler.querySchema = this.querySchema
    handler.paramsSchema = this.paramsSchema
    handler.authService = authService

    return handler
  }

  /**
   * Finalizes the handler chain and returns an Express-compatible route handler.
   * Validates request body, query, and params if schemas are provided,
   * and enforces authentication if authorize() was called.
   *
   * @example
   * app.post(
   *   "/users",
   *   createRouteHandler()
   *     .validateBody(z.object({ name: z.string() }))
   *     .authorize(authService)
   *     .handle(async ({ data, user, res }) => {
   *       // Your logic here
   *       res.json({ user, ...data.body })
   *     })
   * )
   *
   * @param fn - The handler function to execute after validation/auth.
   * @returns An Express route handler function.
   */
  handle(
    fn: HandlerFunction<B, Q, P, U>,
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req, res, next) => {
      try {
        let body: B | undefined
        let query: Q | undefined
        let params: P | undefined
        let user: UserSession | undefined

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

        // Authorization
        if (this.authService) {
          user = this.authService.getUser(req)
          if (!user) {
            res.status(401).json(
              ProblemDetails.create({
                type: "https://example.com/probs/unauthorized",
                title: "Unauthorized",
                status: 401,
                detail: "You must be logged in to access this resource.",
              }),
            )
            return
          }
        }

        await fn({
          req,
          res,
          next,
          data: {
            body: (body as B) ?? ({} as B),
            query: (query as Q) ?? ({} as Q),
            params: (params as P) ?? ({} as P),
          },
          user: user as U,
        })
      } catch (error) {
        next(error)
      }
    }
  }
}

/**
 * Creates a new chainable RouterHandler instance for building
 * type-safe, validated, and optionally authenticated Express route handlers.
 *
 * @example
 * app.get(
 *   "/items/:id",
 *   createRouteHandler()
 *     .validateParams(z.object({ id: z.string().uuid() }))
 *     .handle(async ({ data, res }) => {
 *       // Access data.params.id here
 *       res.json({ id: data.params.id })
 *     })
 * )
 *
 * @returns A new RouterHandler instance.
 */
export function createRouteHandler(): RouterHandler {
  return new RouterHandler()
}
