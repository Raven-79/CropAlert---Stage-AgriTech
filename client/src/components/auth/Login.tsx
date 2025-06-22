import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginProps = {
    onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  return (
    <div className="flex flex-col justify-center items-center p-8 gap-6 w-full md:w-1/2 border-2 rounded-lg md:rounded-none md:border-0 md:border-r border-primary">
      <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
      <div className="w-full max-w-sm ">
        <form className="w-full max-w-sm space-y-4">
          <Input type="email" placeholder="Email" required />
          <Input type="password" placeholder="Password" required />
          <Button className="w-full cursor-pointer" type="submit">
            Login
          </Button>
        </form>
        {/* <div className="text-sm text-gray-600 text-center my-1">Don't have an account?</div> */}
        <div className="w-full max-w-sm mt-2">
          <Button
            variant="outline"
            className=" text-black bg-secondary-background hover:bg-secondary-background   hover:shadow-lg cursor-pointer w-full"
            onClick={onSwitchToRegister}
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}
