import { HttpResponseResolver } from "msw"
import { isDeepStrictEqual } from "util"

export function withJsonBody<TExpectedBody>(
  expectedBody: TExpectedBody,
  resolver: HttpResponseResolver,
): HttpResponseResolver {
  return async (args) => {
    const { request } = args

    const contentType = request.headers.get("Content-Type") || ""
    if (!contentType.includes("application/json")) {
      return
    }

    const actualBody = await request.clone().json()

    if (!isDeepStrictEqual(actualBody, expectedBody)) {
      console.error("Request body did not match!", {
        expectedBody,
        actualBody,
      })
      return
    }

    return resolver(args)
  }
}
