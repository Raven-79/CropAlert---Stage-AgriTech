"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FlaskConical, Tractor } from "lucide-react";
import clsx from "clsx";
type RegisterProps = {
  onSwitchToLogin: () => void;
};
export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [selectedRole, setSelectedRole] = useState<
    "farmer" | "agronomist" | null
  >(null);

  const handleRoleSelect = (role: "farmer" | "agronomist") => {
    setSelectedRole(role);
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 gap-6 w-full md:w-1/2 border-2 rounded-lg md:rounded-none md:border-0 md:border-r border-primary">
      <div
        onClick={onSwitchToLogin}
        className="self-start flex items-center gap-2 text-primary  cursor-pointer "
      >
        <ArrowLeft size={18} />
        Back to Login
      </div>
      <h2 className="text-2xl font-bold text-primary mb-2">
        Create an Account
      </h2>

      <form className="w-full max-w-sm space-y-4">
        <div className="flex gap-4">
          <Input type="text" placeholder="First Name" required />
          <Input type="text" placeholder="Last Name" required />
        </div>
        <Input type="email" placeholder="Email" required />
        <Input type="password" placeholder="Password" required />
        <Input type="password" placeholder="Confirm Password" required />

        <div className="text-sm text-gray-600">Choose your role:</div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleRoleSelect("farmer")}
            className={clsx(
              "flex items-center gap-2 text-black bg-secondary-background hover:scale-105 hover:shadow-lg transition-all hover:bg-secondary-backgroun",
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
              "flex items-center gap-2 text-black bg-secondary-background hover:scale-105 hover:shadow-lg transition-all hover:bg-secondary-backgroun",
              selectedRole === "agronomist" && "ring-2 ring-primary"
            )}
          >
            <FlaskConical size={18} /> Agronomist
          </Button>
        </div>

        <Button className="w-full mt-4" type="submit">
          Register
        </Button>
      </form>
    </div>
  );
}
