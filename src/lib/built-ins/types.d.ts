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
     * Capitalizes the first word in the string.
     */
    capitalizeSentence(): string;

    /**
     * Generates a deterministic numeric hash for the string.
     */
    hash(): number;
  }
}

export {};
