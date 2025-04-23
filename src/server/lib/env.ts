import { z } from "zod"
import "dotenv/config"

const envSchema = z.object({
  MONGODB_URL: z.string().url(),
})

const envResult = envSchema.safeParse(process.env)

if (envResult.error) {
  console.error("Invalid environment variables", envResult.error.errors)
  throw new Error(`Invalid environment variables`)
}

export default envResult.data
