import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/utils/api";

/* =====================
   TYPES
===================== */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "student";
  phone: string;
  usn: string;
  branch: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

/* =====================
   CONTEXT
===================== */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* =====================
   PROVIDER
===================== */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ restore user on refresh
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("Failed to restore session", err);
        // logout(); // don't force logout if server is just down
      }
    };
    fetchUser();
  }, []);

  /* =====================
      SIGNUP
  ===================== */
  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      // notify listeners (notifications context) just in case
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Signup failed", error);
      return false;
    }
  };

  /* =====================
      LOGIN  ✅
  ===================== */
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);

      // ✅ force notification reload after login
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  /* =====================
      LOGIN WITH GOOGLE 
  ===================== */
  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.post("/auth/google", { token: credential });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);

      // force notification reload after login
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (e) {
      console.error("Google Login failed", e);
      return false;
    }
  };

  /* =====================
      LOGOUT
  ===================== */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // also tell listeners auth changed
    window.dispatchEvent(new Event("storage"));
  };

  /* =====================
      UPDATE USER
  ===================== */
  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =====================
   HOOK
===================== */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
