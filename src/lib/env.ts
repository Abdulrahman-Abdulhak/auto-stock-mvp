import { z } from "zod";

/**
 * Runtime environment validation schema.
 * - `NEXT_PUBLIC_APP_ENV` must be one of the allowed environment names.
 * - `WEBSITE_URL` is required and must be a valid URL.
 * - `API_BASE_URL` and `IMAGES_BASE_URL` are optional URLs.
 * - `ALLOWED_ORIGINS`, if provided, is a comma-separated string transformed
 *   into an array of trimmed origins.
 */
const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]),
  WEBSITE_URL: z.url(),
  API_BASE_URL: z.url().optional(),
  IMAGES_BASE_URL: z.url().optional(),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((origins) =>
      origins
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
});

type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables at startup. If validation fails,
 * a descriptive error is logged and the process throws to prevent running
 * with an invalid configuration.
 * @param input The current process.env to be parsed
 * @throws when the env could'nt be parsed successfully
 * @returns Valid typed env object
 */
export function parseEnv(input: NodeJS.ProcessEnv): Env {
  const parsedEnv = envSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: input.NEXT_PUBLIC_APP_ENV,
    API_BASE_URL: input.API_BASE_URL,
    WEBSITE_URL: input.WEBSITE_URL,
    IMAGES_BASE_URL: input.IMAGES_BASE_URL,
    ALLOWED_ORIGINS: input.ALLOWED_ORIGINS,
  });

  if (!parsedEnv.success) {
    if (!process.env.VITEST) {
      console.log(input);
      console.error("Invalid environment variables:", parsedEnv.error.issues);
    }

    throw new Error("Invalid environment variables");
  }

  return parsedEnv.data;
}

let _env: Env | null = null;
function getEnv(): Env {
  if (_env) return _env;
  _env = parseEnv(process.env);
  return _env;
}

/**
 * Exported validated environment object.
 * Use `env` for strongly-typed access to runtime server configurations.
 */
export const env: Env = new Proxy({} as Env, {
  get(_, prop: keyof Env) {
    return getEnv()[prop];
  },
});
