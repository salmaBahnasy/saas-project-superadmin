import { Navigate, Outlet } from "react-router-dom";
import { isPlatformAdminSession } from "../../auth/session";
import { PlatformLayout } from "./PlatformLayout.jsx";

export function ProtectedPlatform() {
  if (!isPlatformAdminSession()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <PlatformLayout>
      <Outlet />
    </PlatformLayout>
  );
}
