import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useUserStore } from "../stores/user";

export default function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const user = useUserStore((state) => state.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
