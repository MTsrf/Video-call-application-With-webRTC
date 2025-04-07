import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import { Spin } from "antd";

interface AuthGuardProps {
  children: React.ReactNode;
}
const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <Spin />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={"/login"} replace />;
};

export default AuthGuard;
