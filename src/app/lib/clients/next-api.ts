import { fetchWrapper, IClient } from "."

export const NextApiClient: IClient = {
  fetch: fetchWrapper({
    baseUrl: "/api",
    defaultConfig: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  }),
  otelServiceName: "Create_Nhollas_App.Backend",
}
