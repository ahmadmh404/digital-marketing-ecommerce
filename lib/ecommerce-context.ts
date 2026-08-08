import { useAuth, useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

/**
 * Hook to get Clerk user information for ecommerce operations
 */
export const useEcommerceUser = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return {
    isSignedIn,
    userId: user?.id ?? null,
    user,
  };
};
