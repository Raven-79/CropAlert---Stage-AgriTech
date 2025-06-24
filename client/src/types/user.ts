export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "farmer" | "agronomist" | "admin";
  subscribed_crops?: string[]; // Optional, only for farmers
  created_alerts?: string[]; // Optional, only for agronomists
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type ResgisterUser = Omit<User, "id"> & {
  password: string;
  confirmPassword: string;
};

export type LoginUser = {
  email: string;
  password: string;
};
