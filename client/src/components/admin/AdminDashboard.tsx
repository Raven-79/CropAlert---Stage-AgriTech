import { useState, useEffect } from "react";
import type { User } from "@/types/user";
import type { UserFilters as Filters } from "@/types/user";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    roleFilter: "all",
    approvalFilter: "all",
  });
  const [isLoading, setIsLoading] = useState(true);
  // Removed refreshKey state as it is unused

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/users");
        const data = await response.json();
        // Ensure IDs are numbers for consistent comparison
        const usersWithNumericIds = data.map((user: User) => ({
          ...user,
          id: Number(user.id)
        }));
        setUsers(usersWithNumericIds);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Removed refreshKey from dependency array

  // Apply filters
  useEffect(() => {
    let result = users.filter((user) => user.role !== "admin");

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query)
      );
    }

    if (filters.roleFilter !== "all") {
      result = result.filter((user) => user.role === filters.roleFilter);
    }

    if (filters.approvalFilter !== "all") {
      const isApproved = filters.approvalFilter === "approved";
      result = result.filter((user) => user.is_approved === isApproved);
    }

    setFilteredUsers(result);
  }, [users, filters]);

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/approve/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Option 1: Optimistic update
        setUsers(users.map(user => 
          Number(user.id) === userId ? { ...user, is_approved: true } : user
        ));
        
        // Option 2: Force refresh (uncomment if optimistic update doesn't work)
        // setRefreshKey(prev => prev + 1);
      } else {
        console.error("Failed to approve user:", await response.json());
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleDecline = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/decline/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Option 1: Optimistic update
        setUsers(users.map(user => 
          Number(user.id) === userId ? { ...user, is_approved: false } : user
        ));
        
        // Option 2: Force refresh (uncomment if optimistic update doesn't work)
        // setRefreshKey(prev => prev + 1);
      } else {
        console.error("Failed to decline user:", await response.json());
      }
    } catch (error) {
      console.error("Error declining user:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <UserFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found matching your criteria
        </div>
      )}
    </div>
  );
}