import "@lib/built-ins";
import { describe, expect, it } from "vitest";

describe("Array.prototype.toBool", () => {
  it("returns false for empty arrays", () => {
    expect([].toBool()).toBe(false);
  });

  it("returns true for non-empty arrays", () => {
    expect([1].toBool()).toBe(true);
    expect(["x", "y"].toBool()).toBe(true);
    expect([null].toBool()).toBe(true);
  });

  it("derives truthiness from array length (not contents)", () => {
    // Sparse arrays still have a length > 0
    expect(new Array(1).toBool()).toBe(true);
    expect(new Array(3).toBool()).toBe(true);
  });

  it("does not mutate the array", () => {
    const arr = [1, 2, 3];
    const before = arr.slice();

    const result = arr.toBool();

    expect(result).toBe(true);
    expect(arr).toEqual(before);
  });

  it("returns a boolean value", () => {
    const v1 = [].toBool();
    const v2 = [0].toBool();

    expect(typeof v1).toBe("boolean");
    expect(typeof v2).toBe("boolean");
  });
});
