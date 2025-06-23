import { Route, Routes } from "react-router";

import Auth from "./components/auth/Auth";
import Profile from "./components/profile/Profile";
import Alerts from "./components/alerts/Alerts";
import Navbar from "./components/navBar/NavBar";
import FindAlert from "./components/alerts/FindAlert";
import Home from "./components/home/Home";
import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/search" element={<FindAlert/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  );
}

export default App;
