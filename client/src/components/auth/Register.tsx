import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FlaskConical, Tractor } from "lucide-react";
import clsx from "clsx";
import type { ResgisterUser } from "@/types/user";
import { useNavigate } from "react-router";
import { useUserStore } from "../stores/user";
type RegisterProps = {
  onSwitchToLogin: () => void;
};

async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "farmer" | "agronomist" | "admin";
}) {
  const response = await fetch("http:/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      result.error || result.errors?.[0] || "Registration failed"
    );
  }

  return result;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<
    "farmer" | "agronomist" | "admin" | null
  >(null);
  const [resgisterData, setRegisterData] = useState<ResgisterUser>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
  });

  const [canRegister, setCanRegister] = useState(false);

  useEffect(() => {
    const { first_name, last_name, email, password, confirmPassword } =
      resgisterData;
    const valid =
      first_name &&
      last_name &&
      email &&
      password === confirmPassword &&
      selectedRole;
    setCanRegister(Boolean(valid));
  }, [resgisterData, selectedRole]);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("Login successful!", data);
      useUserStore
        .getState()
        .fetchProfile()
        .then(() => {
          const user = useUserStore.getState().user;
          if (user && user.role === "admin") {
            navigate("/dashboard");
          } else if (user && user.role === "farmer") {
            navigate("/farmers-alert");
          } else {
            navigate("/");
          }
        });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      } else {
        console.error("Login error:", error);
      }
    },
  });

  const handleChange = (field: keyof ResgisterUser, value: string) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleSelect = (role: "farmer" | "agronomist" | "admin") => {
    setSelectedRole(role);
    setRegisterData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      first_name: resgisterData.first_name,
      last_name: resgisterData.last_name,
      email: resgisterData.email,
      password: resgisterData.password,
      role: resgisterData.role,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 gap-6 w-full md:w-1/2 border-2 rounded-lg md:rounded-none md:border-0 md:border-r border-primary">
      <div
        onClick={onSwitchToLogin}
        className="self-start flex items-center gap-2 text-primary cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back to Login
      </div>
      <h2 className="text-2xl font-bold text-primary mb-2">
        Create an Account
      </h2>

      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="First Name"
            required
            value={resgisterData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last Name"
            required
            value={resgisterData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
          />
        </div>
        <Input
          type="email"
          placeholder="Email"
          required
          value={resgisterData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          required
          value={resgisterData.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          required
          value={resgisterData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
        />

        <div className="text-sm text-gray-600">Choose your role:</div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleRoleSelect("farmer")}
            className={clsx(
              "flex items-center gap-2 text-black bg-secondary-background hover:scale-105 hover:shadow-lg transition-all",
              selectedRole === "farmer" && "ring-2 ring-primary"
            )}
          >
            <Tractor size={18} /> Farmer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleRoleSelect("agronomist")}
            className={clsx(
              "flex items-center gap-2 text-black bg-secondary-background hover:scale-105 hover:shadow-lg transition-all",
              selectedRole === "agronomist" && "ring-2 ring-primary"
            )}
          >
            <FlaskConical size={18} /> Agronomist
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            {(mutation.error as Error)?.message}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="text-green-600 text-sm">Registered successfully!</p>
        )}

        <Button
          className="w-full mt-4"
          type="submit"
          disabled={!canRegister || mutation.isPending}
        >
          {mutation.isPending ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
