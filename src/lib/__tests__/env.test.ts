import { describe, expect, it } from "vitest";

import { parseEnv } from "../env";

describe("env parsing", () => {
  it("parses minimal valid env", () => {
    const env = parseEnv({
      NEXT_PUBLIC_APP_ENV: "development",
      WEBSITE_URL: "https://example.com",
    } as any);

    expect(env.NEXT_PUBLIC_APP_ENV).toBe("development");
    expect(env.WEBSITE_URL).toBe("https://example.com");
    expect(env.API_BASE_URL).toBeUndefined();
    expect(env.IMAGES_BASE_URL).toBeUndefined();
    expect(env.ALLOWED_ORIGINS).toBeUndefined();
  });

  it("rejects invalid NEXT_PUBLIC_APP_ENV", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_ENV: "dev",
        WEBSITE_URL: "https://example.com",
      } as any)
    ).toThrow(/Invalid environment variables/i);
  });

  it("rejects missing WEBSITE_URL", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_ENV: "production",
      } as any)
    ).toThrow(/Invalid environment variables/i);
  });

  it("rejects invalid WEBSITE_URL", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_ENV: "production",
        WEBSITE_URL: "not-a-url",
      } as any)
    ).toThrow(/Invalid environment variables/i);
  });

  it("accepts optional URLs when valid", () => {
    const env = parseEnv({
      NEXT_PUBLIC_APP_ENV: "staging",
      WEBSITE_URL: "https://example.com",
      API_BASE_URL: "https://api.example.com",
      IMAGES_BASE_URL: "https://img.example.com",
    } as any);

    expect(env.API_BASE_URL).toBe("https://api.example.com");
    expect(env.IMAGES_BASE_URL).toBe("https://img.example.com");
  });

  it("rejects optional URLs when invalid", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_ENV: "staging",
        WEBSITE_URL: "https://example.com",
        API_BASE_URL: "nope",
      } as any)
    ).toThrow(/Invalid environment variables/i);

    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_ENV: "staging",
        WEBSITE_URL: "https://example.com",
        IMAGES_BASE_URL: "still-nope",
      } as any)
    ).toThrow(/Invalid environment variables/i);
  });

  it("transforms ALLOWED_ORIGINS into a trimmed string array", () => {
    const env = parseEnv({
      NEXT_PUBLIC_APP_ENV: "production",
      WEBSITE_URL: "https://example.com",
      ALLOWED_ORIGINS: " https://a.com,https://b.com ,  , https://c.com ",
    } as any);

    expect(env.ALLOWED_ORIGINS).toEqual([
      "https://a.com",
      "https://b.com",
      "https://c.com",
    ]);
  });

  it("transforms ALLOWED_ORIGINS empty string to empty array", () => {
    const env = parseEnv({
      NEXT_PUBLIC_APP_ENV: "production",
      WEBSITE_URL: "https://example.com",
      ALLOWED_ORIGINS: "   ,   ",
    } as any);

    expect(env.ALLOWED_ORIGINS).toEqual([]);
  });
});
