import type { NextConfig } from "next";
import { BASE_PATH } from "./site.config.mjs";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      // Tên repository chỉ khai báo ở `site.config.mjs`; đừng chép chuỗi vào đây.
      assetPrefix: BASE_PATH,
    }
  : {};

export default nextConfig;
