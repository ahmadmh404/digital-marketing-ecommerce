import useStore from "@/store";
import { useUser } from "@clerk/nextjs";

export function injectUserInfo() {
  const { user } = useUser();
  const { initUserInfo } = useStore();

  initUserInfo(user?.id || null);
}
