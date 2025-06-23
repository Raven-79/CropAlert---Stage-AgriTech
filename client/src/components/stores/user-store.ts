import type { UserProfile } from "@/types/user";
import { create } from "zustand";

type UserStore = {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  fetchProfile: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  fetchProfile: async () => {
    try {
      console.log("All cookies:", document.cookie);
      console.log("Making request to profile endpoint...");
      const response = await fetch("http://localhost:5000/user/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const userData = await response.json();
      set({ user: userData });
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  },
}));
