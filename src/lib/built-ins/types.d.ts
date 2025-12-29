declare global {
  interface ObjectConstructor {
    /**
     * Logical exclusive OR between two values.
     * Returns true when exactly one of the values is truthy.
     * @param val1 - First value to evaluate
     * @param val2 - Second value to evaluate
     */
    xor(val1: any, val2: any): boolean;

    /**
     * Checks whether a value is a primitive type.
     * Supports string, boolean, number, and bigint.
     *
     * works on all values.
     * @see [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values)
     */
    isPrimitive(val: any): boolean;

    /**
     * Checks whether typeof value equals the provided type string.
     * @param val - Value to check
     * @param type - Type string to compare against (e.g. "string", "object")
     * @returns {boolean}
     */
    is(
      val: any,
      type:
        | "string"
        | "boolean"
        | "number"
        | "bigint"
        | "function"
        | "object"
        | "undefined"
        | "symbol"
    ): boolean;

    /**
     * Returns the boolean form of a value. Arrays evaluate to false when empty.
     * Null and undefined return false.
     * @param val - Value to convert to boolean
     */
    booleanify(val: any): boolean;
  }

  interface Object {
    /**
     * Returns the boolean form of the object.
     * Arrays return false when empty.
     */
    toBool(): boolean;

    /**
     * Checks whether the current object's primitive value is a primitive type.
     *
     * won't work on null or undefined values.
     * @see [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values)
     */
    isPrimitive(): boolean;

    /**
     * Checks the type of the current object's primitive value.
     * @param type - Type string to compare against
     */
    isType(type: Parameters<ObjectConstructor["is"][0]>): boolean;

    /**
     * Returns a new object that merges the current object with the provided partial update.
     * The update may be an object or a function that receives the current object and returns a partial update.
     * @template T
     * @param newObj - Partial update or updater function
     * @returns Merged object
     */
    modify<T extends Object>(obj: Partial<T> | ((obj: T) => Partial<T>)): T;

    /**
     * Returns a new object that omits the provided keys from the given object.
     * @template T, K
     * @param obj - Source object
     * @param keys - Keys to remove
     * @returns Object without the specified keys
     */
    omit<T extends object, K extends readonly (keyof T)[]>(
      obj: T,
      keys: K
    ): Omit<T, K[number]>;
  }

  interface Array<T> {
    /**
     * Returns false when the list is empty, otherwise it returns true.
     * Useful shorthand to treat arrays as boolean values based on length.
     * @returns {boolean}
     */
    toBool(): boolean;
  }

  interface String {
    /**
     * Splits the string into words using the provided separator.
     * Consecutive whitespace is normalized before splitting.
     * @param separator - Separator to use for splitting
     */
    toWords(separator: string = " "): string[];

    /**
     * Returns initials from the string (e.g., "John Doe" -> "JD").
     * @param maxInitialsCount - Maximum number of initials to return
     */
    initials(maxInitialsCount = 2): string;

    /**
     * Capitalizes each word in the string.
     */
    capitalize(): string;

    /**
     * Generates a deterministic numeric hash for the string.
     */
    hash(): number;
  }
}

export {};
