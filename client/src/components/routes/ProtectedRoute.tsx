import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useUserStore } from "../stores/user";

type Props = {
  children: ReactNode;
  roles?: Array<"farmer" | "agronomist" | "admin">;
};

export default function ProtectedRoute({ children, roles }: Props) {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  // Redirect to /auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to NotFound or home if role not allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="*" replace />;
  }

  return <>{children}</>;
}
