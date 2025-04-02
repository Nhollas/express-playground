import { z } from "zod"

const envSchema = z.object({
  TELETRAAN_API_URL: z.string().url(),
})

const envResult = envSchema.safeParse(process.env)

if (envResult.error) {
  throw new Error("Invalid environment variables: " + envResult.error.format())
}

export default envResult.data
