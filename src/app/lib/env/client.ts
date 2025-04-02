import { z, infer as Infer } from "zod"

type ClientEnvSchema = Infer<typeof clientEnvSchema>
type ClientEnv = Record<keyof ClientEnvSchema, unknown>

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_OTEL_COLLECTOR_URL: z.string(),
})

/*
  We have to define client env vars like this so that Next.js can scan through this file at build time
  and replace the uses of `process.env.NEXT_PUBLIC_OTEL_COLLECTOR_URL` with the actual value of the variable.
*/
const clientEnvTemplate: ClientEnv = {
  NEXT_PUBLIC_OTEL_COLLECTOR_URL: process.env.NEXT_PUBLIC_OTEL_COLLECTOR_URL,
}

const clientEnv = clientEnvSchema.parse(clientEnvTemplate)

export default clientEnv
