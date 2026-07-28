import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, businessName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } catch {
        // Corrupted data, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { authAPI } = await import("@/lib/api");
    const response = await authAPI.login(email, password);
    localStorage.setItem("token", response.data.token);
    // Backend returns { token, userId, businessId } - construct a user object
    const userData = {
      id: response.data.userId,
      businessId: response.data.businessId,
      businessName: "", // Will be loaded from profile
      email: email,
      role: "owner",
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);

    // Fetch full profile to get businessName
    try {
      const { default: apiClient } = await import("@/lib/api");
      const profileResp = await apiClient.get("/auth/profile");
      const profileData = profileResp.data;
      const updatedUser = {
        ...userData,
        email: profileData.email,
        businessName: profileData.business_name || "",
        role: profileData.role,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      // Profile fetch failed, use basic user data
    }
  };

  const signup = async (email: string, password: string, businessName: string) => {
    const { authAPI } = await import("@/lib/api");
    const response = await authAPI.signup(email, password, businessName);
    localStorage.setItem("token", response.data.token);
    // Backend returns { token, userId, businessId } - construct a user object
    const userData = {
      id: response.data.userId,
      businessId: response.data.businessId,
      businessName: businessName,
      email: email,
      role: "owner",
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
