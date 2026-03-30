import React from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isChatRoom = location.pathname.includes("/chat/");
  const isHideNavbar = isChatRoom || location.pathname.startsWith("/chat/");

  return (
    <>
      {!isHideNavbar && <Navbar />}
      <div className="flex-1">
        {/* Adds padding only if not in a chat room */}
        <div className={!isHideNavbar ? "md:pt-0 pb-32 md:pb-0" : "h-full"}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
