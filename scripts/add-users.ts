import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { put } from "@vercel/blob";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Usage: pnpm users:add
// Requires NEXT_PUBLIC_CONVEX_URL and BLOB_READ_WRITE_TOKEN in .env.local.
const USERS: { name: string; imagePath: string }[] = [
  { name: "Vicky Zheng", imagePath: "public/images/vicky.png" },
  { name: "Yasoob Rasheed", imagePath: "public/images/yasoob.png" },
];

function timestamp() {
  // e.g. 2026-04-18T23-30-00Z (strips milliseconds, replaces ":" with "-")
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/:/g, "-");
}

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  const convex = new ConvexHttpClient(convexUrl);

  for (const user of USERS) {
    const userId = (await convex.mutation(api.users.create, {
      name: user.name,
    })) as Id<"users">;

    const data = await readFile(resolve(user.imagePath));
    const pathname = `users/${userId}_${timestamp()}.png`;
    const blob = await put(pathname, data, {
      access: "public",
      allowOverwrite: false,
    });

    await convex.mutation(api.users.updateImageUrl, {
      id: userId,
      imageUrl: blob.url,
    });

    console.log(`Created user ${user.name} (${userId}) -> ${blob.url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
