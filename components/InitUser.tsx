"use client";

import { injectUserInfo } from "@/lib/inject-user-info";

export function InitUser() {
  injectUserInfo();

  return null;
}
