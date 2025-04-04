declare module "express" {
  interface Request {
    user?: UserSession
  }
}

export type UserSession = {
  id: string
  username: string
  email: string
}
