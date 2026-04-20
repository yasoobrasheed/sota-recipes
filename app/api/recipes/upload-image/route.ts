import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function timestamp() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/:/g, "-");
}

function extFor(contentType: string, fallbackName?: string) {
  const key = contentType.split(";")[0].trim().toLowerCase();
  if (EXT_BY_CONTENT_TYPE[key]) return EXT_BY_CONTENT_TYPE[key];
  const byName = fallbackName?.split(".").pop()?.toLowerCase();
  return byName || "jpg";
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  let recipeId: Id<"recipes"> | undefined;
  let bytes: ArrayBuffer;
  let imageContentType: string;
  let ext: string;

  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({ error: "Invalid form data" }, { status: 400 });
    }
    recipeId = formData.get("recipeId") as Id<"recipes"> | undefined;
    const file = formData.get("file");
    if (!recipeId) {
      return Response.json({ error: "recipeId is required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return Response.json({ error: "file is required" }, { status: 400 });
    }
    imageContentType = file.type || "application/octet-stream";
    if (!imageContentType.startsWith("image/")) {
      return Response.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }
    bytes = await file.arrayBuffer();
    ext = extFor(imageContentType, file.name);
  } else {
    let imageUrl: string;
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
    if (!imageUrl || typeof imageUrl !== "string") {
      return Response.json({ error: "imageUrl is required" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(imageUrl);
    } catch {
      return Response.json({ error: "Invalid image URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return Response.json(
        { error: "Only HTTP/HTTPS URLs are supported" },
        { status: 400 },
      );
    }

    try {
      const response = await fetch(imageUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeImport/1.0)" },
      });
      if (!response.ok) {
        return Response.json(
          { error: `Failed to fetch image (${response.status})` },
          { status: 400 },
        );
      }
      imageContentType =
        response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!imageContentType.startsWith("image/")) {
        return Response.json(
          { error: "URL did not return an image" },
          { status: 400 },
        );
      }
      bytes = await response.arrayBuffer();
    } catch {
      return Response.json(
        { error: "Failed to fetch the image" },
        { status: 400 },
      );
    }

    ext = extFor(imageContentType, parsed.pathname);
  }

  const pathname = `recipes/${recipeId}_${timestamp()}.${ext}`;

  let blobUrl: string;
  try {
    const blob = await put(pathname, bytes, {
      access: "public",
      allowOverwrite: false,
      contentType: imageContentType,
    });
    blobUrl = blob.url;
  } catch (err) {
    console.error("[upload-image] Blob put failed:", err);
    return Response.json(
      { error: "Failed to upload image to storage" },
      { status: 500 },
    );
  }

  try {
    await fetchMutation(api.recipes.updateImageUrl, {
      id: recipeId,
      imageUrl: blobUrl,
    });
  } catch (err) {
    console.error("[upload-image] Convex patch failed:", err);
    return Response.json(
      { error: "Image uploaded but failed to save to recipe" },
      { status: 500 },
    );
  }

  return Response.json({ imageUrl: blobUrl });
}
