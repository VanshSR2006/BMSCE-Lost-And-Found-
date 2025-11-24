import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ThemeProvider from "@/components/ThemeProvider";

import { ItemsProvider } from "@/contexts/ItemsContext";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Post from "./pages/Post";
import Auth from "./pages/Auth";
import MyPosts from "./pages/MyPosts";
import About from "./pages/About";
import ItemDetail from "./pages/ItemDetail";
import Admin from "./pages/Admin";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ItemsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/post" element={<Post />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/my-posts" element={<MyPosts />} />
                <Route path="/about" element={<About />} />
                <Route path="/items/:id" element={<ItemDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/my-posts" element={<MyPosts />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ItemsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
