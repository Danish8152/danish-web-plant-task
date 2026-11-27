import { redirect } from "next/navigation";
import StoreProvider from "@/store/StoreProvider";
import { getCurrentUser } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/projects");

  return (
    <StoreProvider user={null}>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">{children}</main>
    </StoreProvider>
  );
}
