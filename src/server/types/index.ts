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

export type Item = {
  id: string
  name: string
  description?: string
  price: number
  createdAt: Date
  userId: string
}
