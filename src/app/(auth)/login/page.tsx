import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={safeNextPath(next)} />;
}
