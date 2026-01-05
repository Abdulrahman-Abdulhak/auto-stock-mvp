import { defineProtoMethods } from "./internal";

function arr(objThis: any) {
  return objThis as any[];
}

defineProtoMethods(Array.prototype, {
  toBool: function () {
    // return arr(this).length.toBool();
  },
});
