import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "pm_token";

export interface Session {
  id: number;
  email: string;
}

const ALG = "HS256";

function days(): number {
  const n = Number(process.env.JWT_EXPIRES_DAYS);
  return Number.isFinite(n) && n > 0 ? n : 7;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short. Set it in .env or .env.local (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(session: Session): Promise<string> {
  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(session.id))
    .setIssuedAt()
    .setExpirationTime(`${days()}d`)
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<Session | null> {
  const key = secretKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || typeof payload.email !== "string") return null;
    return { id, email: payload.email };
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: days() * 24 * 60 * 60,
  };
}
