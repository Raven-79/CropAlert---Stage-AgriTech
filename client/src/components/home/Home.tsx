import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_approved: boolean;
  subscribed_crops?: string[];
};

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch("http://localhost:5000/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token might be expired or invalid
            localStorage.removeItem('jwtToken');
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          <strong>Error:</strong> {error.message}
        </div>
        <a 
          href="/auth" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to Your Dashboard</h1>
        
        {userProfile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userProfile.is_approved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {userProfile.is_approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{userProfile.first_name} {userProfile.last_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium capitalize">{userProfile.role}</p>
              </div>
            </div>

            {userProfile.role === 'farmer' && userProfile.subscribed_crops && (
              <div className="mt-4">
                <p className="text-gray-600 mb-2">Subscribed Crops</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.subscribed_crops.map((crop, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              localStorage.removeItem('jwtToken');
              window.location.href = '/auth';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}