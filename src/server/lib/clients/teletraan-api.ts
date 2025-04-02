import { fetchWrapper, IClient } from "."
import env from "../env"

export const TeletraanApiClient: IClient = {
  fetch: fetchWrapper({
    baseUrl: env.TELETRAAN_API_URL,
    defaultConfig: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  }),
}
