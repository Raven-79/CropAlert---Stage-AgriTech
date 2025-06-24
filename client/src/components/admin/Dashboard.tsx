export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg text-gray-700">This is the admin dashboard.</p>
      <p className="text-sm text-gray-500 mt-2">
        You can manage users, alerts, and more here.
      </p>
    </div>
  );
}
