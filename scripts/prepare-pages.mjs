import fs from "node:fs";
import path from "node:path";
import { BASE_PATH, REPOSITORY_NAME } from "../site.config.mjs";

const outputDirectory = path.resolve("dist", "client");

/**
 * Danh sách route được **suy ra từ `app/`**, không chép tay.
 *
 * Trước đây mười tên route nằm cứng ở đây. Thêm một trang mới mà quên sửa danh
 * sách thì build vẫn xanh, nhưng trang đó không được tạo thư mục `<route>/`
 * nên URL dạng `/<route>/` **404 trên GitHub Pages** — và lỗi chỉ lộ ra sau khi
 * đã phát hành. Cùng đúng cái bẫy mà `site.config.mjs` đã cảnh báo cho base path.
 */
const appDirectory = path.resolve("app");
const routeNames = fs
  .readdirSync(appDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  // `_`, `(nhóm)` và `@slot` không tạo ra một đoạn URL riêng.
  .filter((name) => !name.startsWith("_") && !name.startsWith("(") && !name.startsWith("@"))
  .filter((name) => fs.existsSync(path.join(appDirectory, name, "page.tsx")))
  .sort();

// Route động sinh ra nhiều đường dẫn nên không ánh xạ 1-1 sang `<tên>.html`.
// Dừng hẳn thay vì lặng lẽ bỏ qua, để lỗi lộ ra lúc build chứ không phải sau
// khi lên mạng.
const dynamicRoutes = routeNames.filter((name) => name.includes("[") || name.includes("]"));
if (dynamicRoutes.length > 0) {
  throw new Error(
    `prepare-pages.mjs chưa hỗ trợ route động: ${dynamicRoutes.join(", ")}. Hãy bổ sung cách ánh xạ trước khi phát hành.`,
  );
}
if (routeNames.length === 0) {
  throw new Error("Không tìm thấy route nào trong app/; prepare-pages.mjs sẽ không tạo được thư mục nào.");
}

if (!fs.existsSync(path.join(outputDirectory, "index.html"))) {
  throw new Error("GitHub Pages export is missing dist/client/index.html");
}

const prefixedAssetDirectory = path.join(outputDirectory, REPOSITORY_NAME, "_next");
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
  `Prepared GitHub Pages artifact for ${BASE_PATH}/ (${routeNames.length + 1} pages + 404).`,
);
