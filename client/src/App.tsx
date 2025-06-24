import { Route, Routes } from "react-router";
import Auth from "./components/auth/Auth";
import Profile from "./components/profile/Profile";
import Alerts from "./components/alerts/Alerts";
import Navbar from "./components/navBar/NavBar";
import FindAlert from "./components/alerts/FindAlert";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "./components/NotFound";
import AddAlert from "./components/alerts/AddAlert";
import RedirectIfAuthenticated from "./components/routes/RedirectIfAuthenticated";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import Dashboard from "./components/admin/dashboard";

function App() {
  return (
    <>
      {/* Navbar only for authenticated users */}
      <ProtectedRoute>
        <Navbar />
        <Toaster />
      </ProtectedRoute>

      <Routes>
        {/* Public route (redirects if already logged in) */}
        <Route
          path="/auth"
          element={
            <RedirectIfAuthenticated>
              <Auth />
            </RedirectIfAuthenticated>
          }
        />

        {/* Farmer-only route */}
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["farmer"]}>
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* Shared route: farmer & agronomist */}
        <Route
          path="/search"
          element={
            <ProtectedRoute roles={["farmer", "agronomist"]}>
              <FindAlert />
            </ProtectedRoute>
          }
        />

        {/* Farmer-only */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["farmer"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Agronomist-only */}
        <Route
          path="/add-alert"
          element={
            <ProtectedRoute roles={["agronomist"]}>
              <AddAlert />
            </ProtectedRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
export default App;