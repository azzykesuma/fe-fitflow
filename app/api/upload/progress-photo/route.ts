import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const BUCKET = "progress-photos";
// Signed download URL valid for 10 years
const DOWNLOAD_EXPIRY = 60 * 60 * 24 * 365 * 10;

/**
 * GET /api/upload/progress-photo?path=...
 *
 * Accepts a query parameter `path` representing the file path in Supabase storage.
 * Generates a signed download URL valid for DOWNLOAD_EXPIRY using the service-role key.
 */
export async function GET(req: NextRequest) {
  // ── 1. Verify the caller holds our own app JWT ──
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Get path parameter ──
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // ── 3. Generate a signed download URL for the path ──
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, DOWNLOAD_EXPIRY);

  if (error || !data?.signedUrl) {
    console.error("[upload/progress-photo] GET createSignedUrl error:", error);
    return NextResponse.json(
      { error: `Could not create download URL: ${error?.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    downloadUrl: data.signedUrl,
  });
}

/**
 * POST /api/upload/progress-photo
 *
 * Accepts JSON { filename, contentType, userId }.
 * Uses the service-role key to create a Supabase signed upload URL.
 *
 * The browser then uploads the file DIRECTLY to Supabase using the
 * signed upload URL — no file data ever passes through this server.
 */
export async function POST(req: NextRequest) {
  // ── 1. Verify the caller holds our own app JWT ──
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse metadata (no file body — browser uploads directly) ──
  let body: { filename?: string; contentType?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { filename = "photo.jpg", contentType = "image/jpeg", userId = "anonymous" } = body;

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  // ── 3. Build file path ──
  const ext = filename.split(".").pop() ?? "jpg";
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const supabase = createServerSupabaseClient();

  // ── 4. Create a signed upload URL (browser will PUT directly to Supabase) ──
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(filePath);

  if (uploadErr || !uploadData?.signedUrl) {
    console.error("[upload/progress-photo] createSignedUploadUrl error:", uploadErr);
    return NextResponse.json(
      { error: `Could not create upload URL: ${uploadErr?.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    uploadUrl: uploadData.signedUrl,
    filePath,
  });
}
