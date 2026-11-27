"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import type { User } from "@/types";

export default function StoreProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore(user);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
