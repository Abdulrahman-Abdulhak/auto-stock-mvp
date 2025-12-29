import { defineProtoMethods } from "./internal";

defineProtoMethods(Object, {
  xor: (val1, val2) => {
    const and = val1 && val2;
    const or = val1 || val2;
    return or && !and;
  },
  isPrimitive: (val: unknown) => {
    const primitives = ["string", "boolean", "number", "bigint"];
    return primitives.includes(typeof val);
  },
  booleanify: (val) => {
    if (val === null || val === undefined) return false;
    return !!(Array.isArray(val) ? val.length : val.valueOf());
  },
});

defineProtoMethods(Object.prototype, {
  toBool: function () {
    return Object.booleanify(this);
  },
  isPrimitive: function () {
    return Object.isPrimitive(this.valueOf());
  },
  modify: function (newObj) {
    const partial = typeof newObj === "function" ? newObj(this as any) : newObj;
    return { ...this, ...partial };
  },
  omit: function (obj, keys) {
    const result = { ...(obj as any) };

    for (const key of keys) {
      delete result[key];
    }

    return result;
  },
});
