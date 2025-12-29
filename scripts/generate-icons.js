import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICONS_DIR = path.join(__dirname, "..", "src", "assets", "icons");
const OUTPUT_FILE = path.join(
  __dirname,
  "..",
  "src",
  "components",
  "UI",
  "icon",
  "constants.gen.ts"
);

function toPascalCase(name) {
  return name
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// helper: PascalCase -> camelCase
function toCamelCase(pascal) {
  if (!pascal) return pascal;
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function main() {
  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();

  const imports = [];
  const entries = [];

  for (const file of files) {
    const nameWithoutExt = file.replace(/\.svg$/i, "");
    const pascal = toPascalCase(nameWithoutExt);
    const camel = toCamelCase(pascal);

    imports.push(`import ${pascal} from "@assets/icons/${file}";`);
    entries.push(`  ${camel}: ${pascal},`);
  }

  const jsDoc = [
    "/**",
    " * Generated icon registry.",
    " *",
    " * This module exports a mapping from icon names to SVG React components.",
    " * The set of available icons is generated as part of the build/tooling pipeline,",
    " * so treat it as a source of truth for what icons exist at any moment.",
    " */",
  ].join("\n");

  const content = [
    "// ! Auto-generated imports. Do not edit by hand.",
    "",
    ...imports,
    "",
    jsDoc,
    "export const Icons = {",
    ...entries,
    "} as const;",
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`Generated ${OUTPUT_FILE} with ${files.length} icons.`);
}

main();
