import { useEffect, useState } from "react";
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
import { ChatProvider } from "@/contexts/ChatContext";
import StartupSplash from "@/components/StartupSplash";
import Layout from "@/components/Layout";

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
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/directory" element={<PageTransition><Directory /></PageTransition>} />
        <Route path="/post" element={<PageTransition><Post /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/my-posts" element={<PageTransition><MyPosts /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/items/:id" element={<PageTransition><ItemDetail /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/chats" element={<PageTransition><Chats /></PageTransition>} />
        <Route path="/chat/:id" element={<PageTransition><ChatRoom /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <ItemsProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />

                    <AnimatePresence>
                      {showSplash && <StartupSplash />}
                    </AnimatePresence>

                    {/* GLOBAL 3D GLASSMORPHISM MULTI-VIEW BACKGROUND */}
                    <div className="fixed inset-0 min-h-screen bg-[#16052a] -z-50 overflow-hidden pointer-events-none">
                      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/50 rounded-full blur-[80px] mix-blend-screen opacity-50"></div>
                      <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-teal-600/30 rounded-full blur-[80px] mix-blend-screen opacity-50"></div>
                    </div>

                    {/* Scroll to top on every navigation — fixes mobile scroll bleed */}
                    <ScrollToTop />

                    {/* ✅ PARTICLES — RENDER ONCE GLOBALLY */}
                    <ParticlesBackground />

                    <div className="relative z-0 min-h-screen flex flex-col">
                      <Layout>
                        <AnimatedRoutes />
                      </Layout>
                    </div>
                  </TooltipProvider>
                </ItemsProvider>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
