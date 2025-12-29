import { describe, expect, it } from "vitest";

import { detectLocale } from "../request";

describe("i18n/request", () => {
  it("prefers URL locale over cookie and header", () => {
    expect(
      detectLocale({
        pathname: "/ar/about",
        cookieLocale: "en",
        acceptLanguage: "en-US,en;q=0.9",
      })
    ).toBe("ar");
  });

  it("prefers cookie over accept-language", () => {
    expect(
      detectLocale({
        pathname: "/about",
        cookieLocale: "ar",
        acceptLanguage: "en-US,en;q=0.9",
      })
    ).toBe("ar");
  });

  it("uses accept-language when no url/cookie", () => {
    expect(
      detectLocale({
        pathname: "/about",
        cookieLocale: undefined,
        acceptLanguage: "ar,en;q=0.8",
      })
    ).toBe("ar");
  });

  it("falls back when accept-language has unsupported locales", () => {
    expect(
      detectLocale({
        pathname: "/about",
        cookieLocale: undefined,
        acceptLanguage: "fr-FR,fr;q=0.9",
      })
    ).toBe("en"); // default
  });

  it("falls back on empty/invalid accept-language", () => {
    expect(
      detectLocale({
        pathname: "/about",
        cookieLocale: undefined,
        acceptLanguage: "",
      })
    ).toBe("en");
  });
});
