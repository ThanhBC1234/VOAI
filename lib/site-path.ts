const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(`sitePath expects an internal absolute path, received: ${path}`);
  }
  if (!configuredBasePath) return path;
  if (path === configuredBasePath || path.startsWith(`${configuredBasePath}/`)) {
    return path;
  }
  if (path === "/") return `${configuredBasePath}/`;
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? path;
  const suffix = match?.[2] ?? "";
  const finalSegment = pathname.split("/").at(-1) ?? "";
  const githubPagesPath =
    pathname.endsWith("/") || finalSegment.includes(".")
      ? pathname
      : `${pathname}/`;
  return `${configuredBasePath}${githubPagesPath}${suffix}`;
}
