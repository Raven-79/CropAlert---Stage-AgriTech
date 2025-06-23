// components/Auth.tsx

import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login"); 
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-10 bg-gray-50">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-5xl">
        {activeTab === "login" && <Login onSwitchToRegister={() => setActiveTab("register")}/>}
        {activeTab === "register" && <Register onSwitchToLogin={() => setActiveTab("login")}/>}

        <div className="w-full hidden md:block md:w-1/2 h-64 md:h-auto">
          <img
            src="/CorpAlertImage.png"
            alt="Crop Alert Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
