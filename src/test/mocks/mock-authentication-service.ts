import { IAuthenticationService } from "@/server/services/auth-service"
import { UserSession } from "@/server/types"
import { Request } from "express"

export class MockAuthenticationService implements IAuthenticationService {
  private mockUser: UserSession = {
    id: "test-user-id",
    email: "test@test.com",
    username: "testuser",
  }

  constructor(user?: UserSession) {
    if (user) {
      this.mockUser = user
    }
  }

  getUser(_: Request): UserSession | undefined {
    const user = this.mockUser

    return user
  }

  setUser(user: Partial<UserSession>) {
    this.mockUser = {
      ...this.mockUser,
      ...user,
    }
  }

  resetUser() {
    this.mockUser = {
      id: "test-user-id",
      email: "test@test.com",
      username: "testuser",
    }
  }
}
