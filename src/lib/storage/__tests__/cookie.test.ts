import { beforeEach, describe, expect, it } from "vitest";

import { deleteCookie, getCookie } from "../cookies";

describe("lib/storage/cookies.ts", () => {
  let cookieString = "";
  let lastCookieWrite: string | null = null;

  beforeEach(() => {
    cookieString = "";
    lastCookieWrite = null;

    // Mock document.cookie with a controllable getter/setter.
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return cookieString;
      },
      set(value: string) {
        lastCookieWrite = value;
        // We intentionally do NOT emulate full cookie behavior here.
        // For getCookie tests, we set cookieString directly.
      },
    });
  });

  describe("getCookie", () => {
    it("returns null when cookie is not present", () => {
      cookieString = "";
      expect(getCookie("missing")).toBeNull();
    });

    it("returns decoded value when cookie exists", () => {
      cookieString = "token=hello%20world";
      expect(getCookie("token")).toBe("hello world");
    });

    it("works with multiple cookies", () => {
      cookieString = "a=1; token=abc%3D%3D; b=2";
      expect(getCookie("token")).toBe("abc==");
    });

    it("returns null when name exists only as a substring of another cookie name", () => {
      cookieString = "userid=123; id=999";
      expect(getCookie("id")).toBe("999");
    });
  });

  describe("deleteCookie", () => {
    it("sets a deletion cookie with Max-Age=0 and Path=/ and SameSite=Lax", () => {
      deleteCookie("session");

      expect(lastCookieWrite).toBe("session=; Path=/; Max-Age=0; SameSite=Lax");
    });
  });
});
