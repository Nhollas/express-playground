import { Request } from "express"
import { UserSession } from "../types"

export interface IAuthenticationService {
  getUser(req: Request): UserSession | undefined
}

export class AuthenticationService implements IAuthenticationService {
  getUser(req: Request) {
    return req.user
  }
}
