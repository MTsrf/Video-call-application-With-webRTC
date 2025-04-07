import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Spin } from "antd";
import { Navigate } from "react-router";

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard = ({ children }: GuestGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <Spin />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export default GuestGuard;
