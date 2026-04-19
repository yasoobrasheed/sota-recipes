import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

// Usage: pnpm blob:put <path-to-image> [blob-pathname]
// Requires BLOB_READ_WRITE_TOKEN in .env.local (loaded by --env-file).
async function main() {
  const [, , filePath, pathnameArg] = process.argv;
  if (!filePath) {
    console.error("Usage: pnpm blob:put <path-to-image> [blob-pathname]");
    process.exit(1);
  }

  const data = await readFile(filePath);
  const pathname = pathnameArg ?? basename(filePath);
  const blob = await put(pathname, data, {
    access: "public",
    allowOverwrite: false,
  });

  console.log(blob.url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
