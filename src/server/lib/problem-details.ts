type ProblemDetail = {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
} & Record<string, unknown>

class ProblemDetails {
  static create({
    type = "about:blank",
    title,
    status,
    detail,
    instance,
    ...rest
  }: ProblemDetail): ProblemDetail {
    const result: Record<string, unknown> = {
      type,
      title,
      status,
      ...rest,
    }
    if (detail !== undefined) result.detail = detail
    if (instance !== undefined) result.instance = instance
    return result as ProblemDetail
  }
}

export { ProblemDetails }
