"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { LogOutIcon } from "@/components/ui/icons";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);

  async function onLogout() {
    const result = await dispatch(logout());
    if (result.meta.requestStatus === "fulfilled") {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/projects" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            P
          </span>
          Project Manager
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-600 sm:inline" title={user.email}>
              {user.name}
            </span>
          )}
          <button type="button" onClick={onLogout} disabled={status === "loading"} className="btn btn-secondary">
            <LogOutIcon />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
