import React from "react";
import AppLayout from "../features/AppLayout";

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-orange-100">
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-2xl md:m-0 m-4 ">
          <AppLayout />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
