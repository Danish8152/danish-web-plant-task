import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError, parseBody, withApi } from "@/lib/api";
import { connectDb, User } from "@/lib/db";
import { AUTH_COOKIE, authCookieOptions, signToken } from "@/lib/jwt";
import { toUserDTO } from "@/lib/serializers";
import { signupSchema } from "@/lib/validation";

export const POST = withApi(async (req) => {
  const { name, email, password } = await parseBody(req, signupSchema);
  await connectDb();

  if (await User.findOne({ where: { email } })) {
    throw new ApiError(409, "An account with this email already exists", {
      email: ["An account with this email already exists"],
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const res = NextResponse.json({ user: toUserDTO(user) }, { status: 201 });
  res.cookies.set(AUTH_COOKIE, await signToken({ id: user.id, email: user.email }), authCookieOptions());
  return res;
});
