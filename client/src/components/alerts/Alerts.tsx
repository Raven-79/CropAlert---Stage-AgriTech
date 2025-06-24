import type { User } from "@/types/user";
import { useEffect, useState } from "react";

export default function Alerts() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http:/api/user/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          setError(new Error("Failed to fetch user profile"));
          throw new Error("Failed to fetch user profile");
        }
        const data = await response.json();
        console.log("User Profile:", data);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);
  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }
  console.log("User Profile:", userProfile);
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      
      {userProfile && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Welcome, {userProfile.first_name}</h2>
          <p className="text-gray-600">Username: {userProfile.last_name}</p>
          <p className="text-gray-600">Email: {userProfile.email}</p>
        </div>
      )}
      <h1 className="text-2xl font-bold">Alerts Page</h1>
      <p className="mt-4">This is where you can view and manage alerts.</p>
    </div>
  );
}
