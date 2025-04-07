import React, { useEffect, useState } from "react";

interface User {
  roomId: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to initialize auth", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
    sessionStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };
  const value = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
