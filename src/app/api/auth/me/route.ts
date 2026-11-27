import { NextResponse } from "next/server";
import { ApiError, withApi } from "@/lib/api";
import { getCurrentUser, requireSession } from "@/lib/session";

export const GET = withApi(async () => {
  await requireSession();
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Account no longer exists");
  return NextResponse.json({ user });
});
