import { defineProtoMethods } from "./internal";

function str(objThis: any) {
  return objThis as string;
}

defineProtoMethods(String.prototype, {
  toWords: function (separator = " "): string[] {
    return str(this)
      .trim()
      .replace(/\s+/g, separator)
      .split(separator)
      .filter(Boolean);
  },
  initials: function (maxInitialsCount = 2) {
    const _words = str(this).toWords();

    if (_words.length === 0) return "?";

    const letters = _words
      .slice(0, maxInitialsCount)
      .map((word) => word[0]!.toUpperCase());

    return letters.join("");
  },
  capitalize: function () {
    return str(this)
      .toWords()
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join(" ");
  },
  hash: function (): number {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = (hash << 5) - hash + this.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  },
});
