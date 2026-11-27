import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError, parseBody, withApi } from "@/lib/api";
import { connectDb, User } from "@/lib/db";
import { AUTH_COOKIE, authCookieOptions, signToken } from "@/lib/jwt";
import { toUserDTO } from "@/lib/serializers";
import { loginSchema } from "@/lib/validation";

// so an unknown email takes as long to reject as a wrong password
const DUMMY_HASH ="$2b$12$T1n384IuGXrC4yHRNhyoPOACswrm5m22k7cY7n6yhDEix2ituEkkq";

export const POST = withApi(async (req) => {
  const { email, password } = await parseBody(req, loginSchema);
  await connectDb();

  const user = await User.findOne({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, "Invalid email or password");

  const res = NextResponse.json({ user: toUserDTO(user) });
  res.cookies.set(AUTH_COOKIE, await signToken({ id: user.id, email: user.email }), authCookieOptions());
  return res;
});
