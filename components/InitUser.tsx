"use client";

// import { injectUserInfo } from "@/lib/inject-user-info";
import useStore from "@/store";
import { useUser } from "@clerk/nextjs";

export function InitUser() {
  const { user } = useUser();
  const { initUserInfo } = useStore();

  initUserInfo(user?.id || null);

  return <></>;
}
