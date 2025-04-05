
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Sensors from "./pages/Sensors";
import AITools from "./pages/AITools";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ChatbotProvider } from "./components/chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="agritech-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatbotProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="sensors" element={<Sensors />} />
                <Route path="ai-tools" element={<AITools />} />
                <Route path="forum" element={<Forum />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ChatbotProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
