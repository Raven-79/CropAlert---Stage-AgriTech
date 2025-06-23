import { Route, Routes } from "react-router";

import Auth from "./components/auth/Auth";
import Profile from "./components/profile/Profile";
import Alerts from "./components/alerts/Alerts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/alerts" element={<Alerts/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="*" element={<div>404 Not Found</div>} />
      
    </Routes>
  );
}

export default App;
