import { Route, Routes } from "react-router";

import Auth from "./components/auth/Auth";
import Profile from "./components/profile/Profile";
import Alerts from "./components/alerts/Alerts";
import Navbar from "./components/navBar/NavBar";
import FindAlert from "./components/alerts/FindAlert";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "./components/NotFound";
import AddAlert from "./components/alerts/AddAlert";

function App() {
  return (
    <>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Alerts />} />
        <Route path="/search" element={<FindAlert />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-alert" element={<AddAlert />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
