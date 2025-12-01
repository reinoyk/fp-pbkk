"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { novelService } from "@/services/novelService";

// Tipe data User 
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Cek User saat aplikasi pertama kali dimuat (Refresh page aman)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await novelService.getProfile();
        if (data && data.user) {
          setUser(data.user);
          setToken("cookie-auth"); 
        }
      } catch (error) {
        console.log("Not authenticated via cookie");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. Fungsi Login
  const login = (newToken: string, newUser: User) => {
    // Simpan ke State
    setToken(newToken);
    setUser(newUser);

    // Simpan ke Cookies (Biar direfresh ga ilang) - Optional now since we use httpOnly
    Cookies.set("token", newToken, { expires: 7 }); // Expire 7 hari
    Cookies.set("user", JSON.stringify(newUser), { expires: 7 });

    // Redirect ke Dashboard (Home)
    router.push("/"); 
    router.refresh(); // Refresh agar komponen server update (opsional)
  };

  // 3. Fungsi Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook biar gampang dipanggil
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}