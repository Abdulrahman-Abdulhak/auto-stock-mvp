import { describe, expect, it } from "vitest";

import { getDirection } from "../direction";

describe("i18n direction", () => {
  it("returns rtl for Arabic", () => {
    expect(getDirection("ar")).toBe("rtl");
  });

  it("returns ltr for English", () => {
    expect(getDirection("en")).toBe("ltr");
  });

  it("handles region variants (if supported)", () => {
    expect(getDirection("ar-SY")).toBe("rtl");
  });

  it("falls back to ltr for unknown locales", () => {
    expect(getDirection("xx")).toBe("ltr");
  });
});
