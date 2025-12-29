type MethodMap = Record<string, (this: any, ...args: any[]) => any>;

export function defineProtoMethods<T extends object>(
  proto: T,
  methods: MethodMap
) {
  for (const [name, fn] of Object.entries(methods)) {
    if (name in proto) continue;

    Object.defineProperty(proto, name, {
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }
}
