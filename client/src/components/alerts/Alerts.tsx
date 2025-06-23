import { useEffect, useState } from "react";

export default function Alerts() {
  const [userProfile, setUserProfile] = useState(null);
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
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Alerts Page</h1>
      <p className="mt-4">This is where you can view and manage alerts.</p>
    </div>
  );
}
