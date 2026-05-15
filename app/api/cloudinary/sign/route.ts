import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security/rateLimit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN" && session.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = checkRateLimit(session.userId, "cloudinary:sign");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiadas firmas. Reintenta en ${rl.retryInSeconds}s.` },
      { status: 429 },
    );
  }

  const body = await req.json();
  const paramsToSign = body.paramsToSign as Record<string, string | number>;

  const folder = typeof paramsToSign.folder === "string" ? paramsToSign.folder : "";
  if (folder.startsWith("lms/blog/") && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ signature, timestamp: paramsToSign.timestamp });
}
