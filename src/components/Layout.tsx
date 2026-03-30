import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex-1">
        {/* Adds padding to accommodate the fixed navbar and mobile bottom nav */}
        <div className="md:pt-0 pb-32 md:pb-0">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
