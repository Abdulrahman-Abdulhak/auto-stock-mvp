import "@lib/built-ins";
import { describe, expect, it } from "vitest";

describe("Object.xor", () => {
  it("returns true only when exactly one operand is truthy", () => {
    expect(Object.xor(false, false)).toBe(false);
    expect(Object.xor(true, false)).toBe(true);
    expect(Object.xor(false, true)).toBe(true);
    expect(Object.xor(true, true)).toBe(false);
  });

  it("treats inputs using JavaScript truthiness", () => {
    expect(Object.xor(0, 1)).toBe(true);
    expect(Object.xor("a", "b")).toBe(false);
    expect(Object.xor("", "x")).toBe(true);
    expect(Object.xor(null, {})).toBe(true);
  });
});

describe("Object.isPrimitive", () => {
  it("returns true for supported primitive types", () => {
    expect(Object.isPrimitive("x")).toBe(true);
    expect(Object.isPrimitive(false)).toBe(true);
    expect(Object.isPrimitive(0)).toBe(true);
    expect(Object.isPrimitive(10n)).toBe(true);
  });

  it("returns false for non-primitive values and unsupported primitive kinds", () => {
    expect(Object.isPrimitive(undefined)).toBe(false);
    expect(Object.isPrimitive(null)).toBe(false);
    expect(Object.isPrimitive(Symbol("s"))).toBe(false);
    expect(Object.isPrimitive({})).toBe(false);
    expect(Object.isPrimitive([])).toBe(false);
    expect(Object.isPrimitive(() => {})).toBe(false);
  });
});

describe("Object.booleanify", () => {
  it("returns false for null and undefined", () => {
    expect(Object.booleanify(null)).toBe(false);
    expect(Object.booleanify(undefined)).toBe(false);
  });

  it("treats arrays as truthy only when non-empty", () => {
    expect(Object.booleanify([])).toBe(false);
    expect(Object.booleanify([0])).toBe(true);
    expect(Object.booleanify(["value"])).toBe(true);
  });

  it("coerces primitives using their boolean meaning", () => {
    expect(Object.booleanify(0)).toBe(false);
    expect(Object.booleanify(1)).toBe(true);

    expect(Object.booleanify("")).toBe(false);
    expect(Object.booleanify("0")).toBe(true);

    expect(Object.booleanify(false)).toBe(false);
    expect(Object.booleanify(true)).toBe(true);
  });

  it("handles objects in a way that aligns with their value semantics", () => {
    expect(Object.booleanify(new Boolean(false))).toBe(false);
    expect(Object.booleanify(new Boolean(true))).toBe(true);

    expect(Object.booleanify(new Number(0))).toBe(false);
    expect(Object.booleanify(new Number(5))).toBe(true);

    expect(Object.booleanify({})).toBe(true);
  });
});

describe("Object.prototype.toBool", () => {
  it("converts the receiver into a boolean according to Object.booleanify rules", () => {
    expect(({} as any).toBool()).toBe(true);
    expect(([] as any).toBool()).toBe(false);
    expect((["x"] as any).toBool()).toBe(true);
  });

  it("works with boxed primitives", () => {
    expect((new Number(0) as any).toBool()).toBe(false);
    expect((new Number(1) as any).toBool()).toBe(true);
    expect((new Boolean(false) as any).toBool()).toBe(false);
  });
});

describe("Object.prototype.isPrimitive", () => {
  it("reports whether the receiver's value is a supported primitive", () => {
    expect(("hello" as any).isPrimitive()).toBe(true);
    expect((new Number(0) as any).isPrimitive()).toBe(true);
    expect((new Boolean(false) as any).isPrimitive()).toBe(true);
    expect((10n as any).isPrimitive()).toBe(true);
  });

  it("returns false for non-primitive receivers", () => {
    expect(({} as any).isPrimitive()).toBe(false);
    expect(([] as any).isPrimitive()).toBe(false);
    expect((() => ({} as any)).isPrimitive()).toBe(false);
  });
});

describe("Object.prototype.modify", () => {
  it("returns a new object that includes the receiver and the provided partial fields", () => {
    const base = { a: 1 };
    const result = (base as any).modify({ b: 2 });

    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(base); // should not return the same reference
    expect(base).toEqual({ a: 1 }); // should not mutate the receiver
  });

  it("accepts a function to derive the partial fields from the receiver", () => {
    const base = { a: 1, b: 2 };

    const result = (base as any).modify((current: any) => ({
      b: current.a + current.b,
      c: "added",
    }));

    expect(result).toEqual({ a: 1, b: 3, c: "added" });
    expect(base).toEqual({ a: 1, b: 2 }); // should not mutate the receiver
  });

  it("allows overriding existing fields", () => {
    const base = { a: 1, b: 2 };
    const result = (base as any).modify({ b: 999 });

    expect(result).toEqual({ a: 1, b: 999 });
    expect(base).toEqual({ a: 1, b: 2 });
  });
});

describe("Object.prototype.omit", () => {
  it("returns a new object without the specified keys", () => {
    const source = { a: 1, b: 2, c: 3 };

    const result = ({} as any).omit(source, ["b", "c"]);

    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(source);
    expect(source).toEqual({ a: 1, b: 2, c: 3 }); // should not mutate input
  });

  it("ignores keys that do not exist", () => {
    const source = { a: 1 };
    const result = ({} as any).omit(source, ["missing"]);

    expect(result).toEqual({ a: 1 });
    expect(source).toEqual({ a: 1 });
  });

  it("works with an empty keys list", () => {
    const source = { a: 1, b: 2 };
    const result = ({} as any).omit(source, []);

    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(source);
  });
});
