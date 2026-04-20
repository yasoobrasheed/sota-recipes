import { NextRequest } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  let recipeId: string | undefined;
  let imageUrl: string | undefined;
  try {
    const body = await request.json();
    recipeId = body?.recipeId;
    imageUrl = body?.imageUrl;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!recipeId) {
    return Response.json({ error: "recipeId is required" }, { status: 400 });
  }
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return Response.json({ error: "Invalid imageUrl" }, { status: 400 });
  }
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".public.blob.vercel-storage.com")
  ) {
    return Response.json(
      { error: "Only Vercel Blob URLs are accepted" },
      { status: 400 },
    );
  }

  try {
    await fetchMutation(api.recipes.updateImageUrl, {
      id: recipeId as Id<"recipes">,
      imageUrl,
    });
  } catch (err) {
    console.error("[set-image] Convex patch failed:", err);
    return Response.json(
      { error: "Failed to save image URL" },
      { status: 500 },
    );
  }

  return Response.json({ imageUrl });
}
