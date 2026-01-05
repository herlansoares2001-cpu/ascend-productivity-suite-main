import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Finances from "./pages/Finances";
import CalendarPage from "./pages/CalendarPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Books from "./pages/Books";
import ProfileEdit from "./pages/ProfileEdit";
import Achievements from "./pages/Achievements";
// import Notes from "./pages/Notes"; // Disabled for MVP

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

import { useMobileSetup } from "@/hooks/use-mobile-setup";
import { CommandCenter } from "@/components/CommandCenter";
import { useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';

function AppContent() {
  const { user, isLoading } = useAuth();

  useMobileSetup();

  useEffect(() => {
    // Hardware Back Button Logic (Android)
    if ((window as any).Capacitor) {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CommandCenter />
      <PageTransition>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
          <Route path="/finances" element={<ProtectedRoute><Layout><Finances /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><Layout><Diet /></Layout></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><Layout><Books /></Layout></ProtectedRoute>} />

          {/* Profile Pages wrapped in Layout too for consistency, or keep them standalone if preferred. 
              Let's wrap them for the "System" feel.
          */}
          <Route path="/profile/edit" element={<ProtectedRoute><Layout><ProfileEdit /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
