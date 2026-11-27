import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/jwt";

export const POST = withApi(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return res;
});
