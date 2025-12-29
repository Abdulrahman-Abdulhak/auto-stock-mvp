import { describe, expect, it } from "vitest";

import { defaultLocale } from "@config/locale";

import { addLocalePrefix, stripLocalePrefix } from "../routing";

describe("i18n/routing", () => {
  it("prefixes non-localized path", () => {
    expect(addLocalePrefix("/about", "en")).toBe("/en/about");
  });

  it("prefixes root path consistently", () => {
    expect(addLocalePrefix("/", "en")).toBe("/en");
  });

  it("does not double-prefix an already localized path", () => {
    expect(addLocalePrefix("/en/about", "en")).toBe("/en/about");
  });

  it("preserves query and hash", () => {
    expect(addLocalePrefix("/about?x=1#top", "en")).toBe("/en/about?x=1#top");
  });

  it("strips locale prefix", () => {
    expect(stripLocalePrefix("/ar/about")).toEqual({
      locale: "ar",
      pathname: "/about",
    });
  });

  it("uses default locale when none provided", () => {
    expect(stripLocalePrefix("/about")).toEqual({
      locale: defaultLocale,
      pathname: "/about",
    });
  });

  it("treats unknown prefixes as non-locale", () => {
    expect(stripLocalePrefix("/xx/about")).toEqual({
      locale: defaultLocale,
      pathname: "/xx/about",
    });
  });

  it("handles locale root", () => {
    expect(stripLocalePrefix("/en")).toEqual({ locale: "en", pathname: "/" });
    expect(stripLocalePrefix("/en/")).toEqual({ locale: "en", pathname: "/" });
  });
});
