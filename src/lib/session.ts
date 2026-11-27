import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api";
import { connectDb, User } from "@/lib/db";
import { AUTH_COOKIE, verifyToken, type Session } from "@/lib/jwt";
import { toUserDTO } from "@/lib/serializers";

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "You need to log in to do that");
  return session;
}

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  await connectDb();
  const user = await User.findByPk(session.id);
  return user ? toUserDTO(user) : null;
});
