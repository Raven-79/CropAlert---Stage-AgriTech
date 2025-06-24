import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchProfile: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => {
        set({ user: null });
        useUserStore.persist.clearStorage();
      },
      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
      fetchProfile: async () => {
        try {
          const response = await fetch("http:/api/user/profile", {
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
    }),
    {
      name: "user-store",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
