import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

await build({
  entryPoints: ["src/index.js"],
  outfile: "dist/tplink-easy-smart-card.js",
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2022"],
  supported: {
    "template-literal": false,
  },
  legalComments: "none",
  define: {
    __CARD_VERSION__: JSON.stringify(packageJson.version),
  },
  banner: {
    js: `/* TP-Link Easy Smart Card ${packageJson.version} | MIT | Minims */`,
  },
});

console.info(`Built TP-Link Easy Smart Card ${packageJson.version}`);
