import { Request, Response } from "express"
import { IAuthenticationService } from "../services/auth-service"

export const getUserHandler = (authService: IAuthenticationService) => {
  return (req: Request, res: Response) => {
    const user = authService.getUser(req)

    res.status(200).json(user)
  }
}
