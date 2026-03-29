import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ThemeProvider from "@/components/ThemeProvider";
import ParticlesBackground from "@/components/ParticlesBackground";
import PageTransition from "@/components/PageTransition";

import { ItemsProvider } from "@/contexts/ItemsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import Index from "./pages/Index";
import Directory from "./pages/Directory";
import Post from "./pages/Post";
import Auth from "./pages/Auth";
import MyPosts from "./pages/MyPosts";
import Profile from "./pages/Profile";
import About from "./pages/About";
import ItemDetail from "./pages/ItemDetail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

/* ================================
   ROUTE ANIMATIONS CONTROLLER
================================ */
const AnimatedRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ✅ HOME — NO TRANSITION */}
        <Route path="/" element={<Index />} />

        {/* ✅ ALL OTHER ROUTES — SMOOTH TRANSITION */}
        <Route path="/directory" element={<PageTransition><Directory /></PageTransition>} />
        <Route path="/post" element={<PageTransition><Post /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/my-posts" element={<PageTransition><MyPosts /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/items/:id" element={<PageTransition><ItemDetail /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />

        {/* ✅ 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />

      </Routes>
    </AnimatePresence>
  );
};

/* ================================
   APP ROOT
================================ */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ItemsProvider>
              <TooltipProvider>

                <Toaster />
                <Sonner />

                <BrowserRouter>
                  {/* GLOBAL 3D GLASSMORPHISM MULTI-VIEW BACKGROUND */}
                  <div className="fixed inset-0 min-h-screen bg-[#16052a] -z-50 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/50 rounded-full blur-[80px] mix-blend-screen opacity-50"></div>
                    <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-teal-600/30 rounded-full blur-[80px] mix-blend-screen opacity-50"></div>
                  </div>

                  {/* ✅ PARTICLES — RENDER ONCE GLOBALLY */}
                  <ParticlesBackground />

                  <div className="relative z-0 min-h-screen flex flex-col">
                    <AnimatedRoutes />
                  </div>

                </BrowserRouter>
              </TooltipProvider>
            </ItemsProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
