import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(request: Request): Promise<Response> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("recipes/")) {
          throw new Error("Uploads must be under recipes/");
        }
        if (!clientPayload) {
          throw new Error("Missing clientPayload");
        }
        let parsed: { recipeId?: unknown };
        try {
          parsed = JSON.parse(clientPayload);
        } catch {
          throw new Error("Invalid clientPayload");
        }
        if (typeof parsed.recipeId !== "string" || !parsed.recipeId) {
          throw new Error("recipeId is required");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async () => {
        // Convex is patched by the client via /api/recipes/set-image after
        // upload() resolves. This callback is a no-op (and doesn't fire in
        // local dev since Vercel Blob can't call back to localhost).
      },
    });

    return Response.json(json);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
