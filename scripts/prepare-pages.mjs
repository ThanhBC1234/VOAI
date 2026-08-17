import fs from "node:fs";
import path from "node:path";

const outputDirectory = path.resolve("dist", "client");
const routeNames = [
  "assessments",
  "labs",
  "lessons",
  "math",
  "notebooks",
  "practice",
  "resources",
  "roadmap",
  "theory",
];

if (!fs.existsSync(path.join(outputDirectory, "index.html"))) {
  throw new Error("GitHub Pages export is missing dist/client/index.html");
}

const prefixedAssetDirectory = path.join(outputDirectory, "voai-lab", "_next");
const publicAssetDirectory = path.join(outputDirectory, "_next");
if (fs.existsSync(prefixedAssetDirectory)) {
  if (fs.existsSync(publicAssetDirectory)) {
    throw new Error("GitHub Pages export contains two competing _next directories");
  }
  fs.renameSync(prefixedAssetDirectory, publicAssetDirectory);
  fs.rmdirSync(path.dirname(prefixedAssetDirectory));
} else if (!fs.existsSync(publicAssetDirectory)) {
  throw new Error("GitHub Pages export is missing its _next asset directory");
}

for (const routeName of routeNames) {
  const htmlSource = path.join(outputDirectory, `${routeName}.html`);
  const rscSource = path.join(outputDirectory, `${routeName}.rsc`);
  if (!fs.existsSync(htmlSource) || !fs.existsSync(rscSource)) {
    throw new Error(`GitHub Pages export is incomplete for /${routeName}`);
  }
  const routeDirectory = path.join(outputDirectory, routeName);
  const htmlDestination = path.join(routeDirectory, "index.html");
  const rscDestination = path.join(routeDirectory, "index.rsc");
  if (!fs.existsSync(routeDirectory)) fs.mkdirSync(routeDirectory);
  if (!fs.existsSync(htmlDestination)) fs.copyFileSync(htmlSource, htmlDestination);
  if (!fs.existsSync(rscDestination)) fs.copyFileSync(rscSource, rscDestination);
}

fs.writeFileSync(path.join(outputDirectory, ".nojekyll"), "", "utf8");
console.log(
  `Prepared GitHub Pages artifact for /voai-lab/ (${routeNames.length + 1} pages + 404).`,
);
