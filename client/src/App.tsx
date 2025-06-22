import { Route, Routes } from "react-router";

import Auth from "./components/auth/auth";
import Profile from "./components/profile/Profile";
import Alerts from "./components/alerts/Alerts";

function App() {
  return (
    <Routes>

      <Route path="/auth" element={<Auth />} />
      <Route path="/alerts" element={<Alerts/>} />
      <Route path="/profile" element={<Profile/>} />
      
    </Routes>
  );
}

export default App;
