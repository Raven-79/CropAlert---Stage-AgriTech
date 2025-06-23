import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import type { LoginUser } from "@/types/user";
import { useNavigate } from "react-router";
type LoginProps = {
  onSwitchToRegister: () => void;
};

async function loginUser(data: LoginUser) {
  
  const response = await fetch("http://127.0.0.1:5000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Login failed");
  }

  return result;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [canLogin, setCanLogin] = useState(false);

  useEffect(() => {
    const { email, password } = loginData;
    setCanLogin(Boolean(email && password));
  }, [loginData]);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login successful!", data);
      navigate("/");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      } else {
        console.error("Login error:", error);
      }
    },
  });

  const handleChange = (field: keyof typeof loginData, value: string) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      email: loginData.email,
      password: loginData.password,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 gap-6 w-full md:w-1/2 border-2 rounded-lg md:rounded-none md:border-0 md:border-r border-primary">
      <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
      
      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          required
          value={loginData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        
        <Input
          type="password"
          placeholder="Password"
          required
          value={loginData.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            {(mutation.error as Error)?.message || "Login failed"}
          </p>
        )}
        
        {mutation.isSuccess && (
          <p className="text-green-600 text-sm">Login successful!</p>
        )}

        <Button
          className="w-full mt-4"
          type="submit"
          disabled={!canLogin || mutation.isPending}
        >
          {mutation.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="w-full max-w-sm mt-2">
        <Button
          variant="outline"
          className="text-black bg-secondary-background hover:bg-secondary-background hover:shadow-lg cursor-pointer w-full flex items-center gap-2"
          onClick={onSwitchToRegister}
        >
          Don't have an account? Sign up <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}