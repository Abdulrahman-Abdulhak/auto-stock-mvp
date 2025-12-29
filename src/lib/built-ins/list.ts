import { defineProtoMethods } from "./internal";

defineProtoMethods(Array.prototype, {
  toBool: function () {
    return this.length.toBool();
  },
});
