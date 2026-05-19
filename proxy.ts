import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    const isAdminPath = pathname.startsWith("/admin");
    const isInstructorPath = pathname.startsWith("/instructor");

    // STUDENT no entra a áreas de admin ni de instructor.
    if (role === "STUDENT" && (isAdminPath || isInstructorPath)) {
      return NextResponse.redirect(new URL("/student", request.url));
    }

    // INSTRUCTOR no entra al área de admin.
    if (role === "INSTRUCTOR" && isAdminPath) {
      return NextResponse.redirect(new URL("/instructor", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/instructor/:path*"],
  // /verificar/* es público — no requiere sesión
};
