import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StoreProvider from "@/store/StoreProvider";
import { getCurrentUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <StoreProvider user={user}>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </StoreProvider>
  );
}
