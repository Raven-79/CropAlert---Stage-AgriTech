import { Link, useNavigate } from "react-router";
import { Menu, X, User, Key, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUserStore } from "../stores/user";
// import { useToast } from "@/components/ui/use-toast";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const response = await fetch("http:/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");
      clearUser();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto" src="/CorpAlertLogo.png" alt="Logo" />
              <span className="ml-2 text-xl font-semibold">CorpAlert</span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-6">
              {(user?.role === "farmer" || user?.role === "agronomist") && (
                <>
                  <NavLink to="/">My Alerts</NavLink>
                  <NavLink to="/search">Find Alert</NavLink>
                </>
              )}

              {user?.role === "agronomist" && (
                <NavLink to="/add-alert">Create Alert</NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink to="/dashboard">Dashboard</NavLink>
              )}
            </div>
          </div>

          {/* Right side - User Dropdown */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {(user?.role === "farmer" || user?.role === "agronomist") && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/password" className="cursor-pointer">
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* <MobileNavLink to="/dashboard">Dashboard</MobileNavLink> */}
            {(user?.role === "farmer" || user?.role === "agronomist") && (
              <>
                <MobileNavLink to="/">my Alerts</MobileNavLink>
                <MobileNavLink to="/search">Find Alert</MobileNavLink>
                <MobileNavLink to="/profile">Edit Profile</MobileNavLink>
                <MobileNavLink to="/change-password">
                  Change Password
                </MobileNavLink>
                <MobileNavLink to="/">My Alerts</MobileNavLink>
                <MobileNavLink to="/search">Find Alert</MobileNavLink>
              </>
            )}

            {user?.role === "agronomist" && (
              <MobileNavLink to="/add-alert">Create Alert</MobileNavLink>
            )}

            {user?.role === "admin" && (
              <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Reusable components remain the same
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 text-sm font-medium hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
