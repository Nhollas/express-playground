import { clientEnvSchema } from "./client"

const serverEnvSchema = clientEnvSchema.extend({})
const serverEnv = serverEnvSchema.parse(process.env)

export default serverEnv
