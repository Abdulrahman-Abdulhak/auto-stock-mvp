import { describe, expect, it } from "vitest";

import { cn } from "../cn";

describe("lib/cn.ts", () => {
  it("joins strings and ignores falsy values (clsx behavior)", () => {
    expect(cn("a", false && "x", null, undefined, "", "b")).toBe("a b");
  });

  it("supports arrays and nested arrays", () => {
    expect(cn(["a", ["b", null], false, "c"])).toBe("a b c");
  });

  it("supports object syntax (truthy keys included)", () => {
    expect(cn({ a: true, b: false, c: 1, d: 0 })).toBe("a c");
  });

  it("merges conflicting Tailwind utilities (tailwind-merge behavior)", () => {
    // padding conflicts -> keep last
    expect(cn("p-2", "p-4")).toBe("p-4");

    // background conflicts -> keep last
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("keeps non-conflicting utilities", () => {
    expect(cn("p-2", "px-4")).toBe("p-2 px-4");
  });

  it("merges custom font-size group so only the last one remains", () => {
    // This is the main value of your customTwMerge config
    expect(cn("text-heading-3", "text-heading-6")).toBe("text-heading-6");
  });

  it("custom font-size group still plays nicely with other classes", () => {
    expect(cn("text-heading-3", "font-bold", "text-heading-6")).toBe(
      "font-bold text-heading-6"
    );
  });
});
