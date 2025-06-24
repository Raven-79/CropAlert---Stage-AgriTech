import { Route, Routes } from "react-router";
import Auth from "./components/auth/Auth";

import Alerts from "./components/alerts/Alerts";
import Navbar from "./components/navBar/NavBar";
import FindAlert from "./components/alerts/FindAlert";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "./components/NotFound";
// import AddAlert from "./components/alerts/AddAlert";
import RedirectIfAuthenticated from "./components/routes/RedirectIfAuthenticated";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminDashboard from "./components/admin/AdminDashboard";

import UpdatePassword from "./components/profile/Password";
import UpdateProfile from "./components/profile/Profile";
import CreateAlert from "./components/alerts/addAlert/AddAlert";

function App() {
  return (
    <>
      {/* Navbar only for authenticated users */}
      <ProtectedRoute>
        <Navbar />
        <Toaster />
      </ProtectedRoute>

      <Routes>
       
        <Route
          path="/auth"
          element={
            <RedirectIfAuthenticated>
              <Auth />
            </RedirectIfAuthenticated>
          }
        />

     
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["farmer","agronomist"]}>
              <Alerts />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/search"
          element={
            <ProtectedRoute roles={["farmer", "agronomist"]}>
              <FindAlert />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["farmer", "agronomist"]}>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />

      
        <Route
          path="/add-alert"
          element={
            <ProtectedRoute roles={["agronomist"]}>
              <CreateAlert />
            </ProtectedRoute>
          }
        />
         <Route
          path="/password"
          element={
            <ProtectedRoute roles={["agronomist", "farmer"]}>
              <UpdatePassword />
            </ProtectedRoute>
          }
        />

 
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

     
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
export default App;