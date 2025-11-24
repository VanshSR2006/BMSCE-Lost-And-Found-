import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { User, LogOut, Moon, Sun, Home, PlusCircle, Info } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">

        {/* WEBSITE TITLE — Premium Look */}
        <Link
          to="/"
          className="
            text-2xl font-extrabold tracking-tight 
            bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
            bg-clip-text text-transparent
            transition-all duration-300 
            hover:scale-[1.07] hover:opacity-90
          "
        >
          Lost & Found • BMSCE Portal
        </Link>

        {/* CENTER NAV LINKS */}
        <div className="hidden md:flex gap-6 text-[15px] font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/post" className="hover:text-primary transition-colors">Post Item</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        </div>

        {/* RIGHT SIDE MENU */}
        <div className="flex items-center gap-4">

          {/* IF LOGGED OUT → SIGN IN */}
          {!isAuthenticated && (
            <Button
              onClick={() => navigate("/auth")}
              className="transition-all hover:scale-[1.03]"
            >
              Sign In
            </Button>
          )}

          {/* IF LOGGED IN → PROFILE MENU */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 hover:scale-[1.03] transition-all"
                >
                  <User className="h-4 w-4" />
                  {user.name?.split(" ")[0] ?? "User"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 shadow-lg animate-in fade-in-0 zoom-in-95"
              >
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <Home className="h-4 w-4 mr-2" /> Home
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/post")}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Post Item
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-posts")}>
                  <Home className="h-4 w-4 mr-2" />
                  My Posts
                </DropdownMenuItem>

                <DropdownMenuSeparator />


                <DropdownMenuItem onClick={() => navigate("/about")}>
                  <Info className="h-4 w-4 mr-2" /> About
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* THEME TOGGLE */}
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" /> Switch to Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" /> Switch to Light Mode
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* LOGOUT */}
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
