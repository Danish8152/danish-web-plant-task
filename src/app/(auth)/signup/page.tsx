import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={safeNextPath(next)} />;
}
