import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reading/:path*",
    "/listening/:path*",
    "/writing/:path*",
    "/speaking/:path*",
    "/results/:path*",
  ],
};
