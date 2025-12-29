import "@lib/built-ins";
import { describe, expect, it } from "vitest";

describe("String.prototype.toWords", () => {
  it("splits words and normalizes whitespace", () => {
    expect("hello world".toWords()).toEqual(["hello", "world"]);
    expect("  hello\tworld\nagain  ".toWords()).toEqual([
      "hello",
      "world",
      "again",
    ]);
  });

  it("supports a custom separator", () => {
    expect("hello   world   again".toWords("_")).toEqual([
      "hello",
      "world",
      "again",
    ]);
  });

  it("returns an empty array for empty or whitespace-only strings", () => {
    expect("".toWords()).toEqual([]);
    expect("   ".toWords()).toEqual([]);
    expect("\n\t".toWords()).toEqual([]);
  });
});

describe("String.prototype.initials", () => {
  it("returns initials for the first words", () => {
    expect("hello world".initials()).toBe("HW");
    expect("hello world again".initials(2)).toBe("HW");
    expect("single".initials()).toBe("S");
  });

  it("uppercases the initials", () => {
    expect("hello world".initials()).toBe("HW");
    expect("hELlo wORld".initials()).toBe("HW");
  });

  it("respects maxInitialsCount", () => {
    expect("one two three".initials(1)).toBe("O");
    expect("one two three".initials(2)).toBe("OT");
    expect("one two three".initials(3)).toBe("OTT");
    expect("one two three".initials(99)).toBe("OTT");
  });

  it("returns a fallback when no words exist", () => {
    expect("".initials()).toBe("?");
    expect("   ".initials()).toBe("?");
  });
});

describe("String.prototype.capitalize", () => {
  it("capitalizes the first letter of each word", () => {
    expect("hello world".capitalize()).toBe("Hello World");
    expect("hello world again".capitalize()).toBe("Hello World Again");
  });

  it("normalizes whitespace before capitalizing", () => {
    expect("  hello\tworld\nagain  ".capitalize()).toBe("Hello World Again");
  });

  it("only affects the first character of each word", () => {
    expect("hELLo wORld".capitalize()).toBe("HELLo WORld");
    expect("javaScript".capitalize()).toBe("JavaScript");
  });

  it("returns an empty string when there are no words", () => {
    expect("".capitalize()).toBe("");
    expect("   ".capitalize()).toBe("");
  });
});

describe("String.prototype.hash", () => {
  it("returns a non-negative integer", () => {
    const h = "hello".hash();
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic for the same input", () => {
    expect("hello".hash()).toBe("hello".hash());
    expect("Hello".hash()).toBe("Hello".hash());
    expect("".hash()).toBe("".hash());
  });

  it("returns 0 for an empty string", () => {
    expect("".hash()).toBe(0);
  });

  it("usually changes when the input changes (sanity check)", () => {
    // Not a guarantee (hash collisions exist), just a pragmatic smoke test.
    expect("hello".hash()).not.toBe("hellO".hash());
    expect("hello".hash()).not.toBe("hello!".hash());
  });
});
