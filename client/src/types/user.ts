export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "farmer" | "agronomist";
  crops?: string[]; // Optional, only for farmers
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
