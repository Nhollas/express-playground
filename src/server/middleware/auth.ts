import { Request, Response, NextFunction } from "express"
import { IAuthenticationService } from "../services/auth-service"

export const authMiddleware = (authService: IAuthenticationService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = authService.getUser(req)

    if (!user) {
      res.status(401).json({ error: "Unauthorized" })
    } else {
      next()
    }
  }
}
