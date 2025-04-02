import { z } from "zod"

const envSchema = z.object({
  TELETRAAN_API_URL: z.string().url(),
})

const envResult = envSchema.safeParse(process.env)

if (envResult.error) {
  console.error("Invalid environment variables", envResult.error.errors)
  throw new Error(`Invalid environment variables`)
}

export default envResult.data
