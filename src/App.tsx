import { Toaster as Sonner, toast } from "@/components/ui/sonner";
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
import Health from "./pages/Health";
import ProfileEdit from "./pages/ProfileEdit";
import Achievements from "./pages/Achievements";
import Notes from "./pages/Notes";
import Plans from "./pages/Plans";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";

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

  // -- STRIPE SUCCESS HANDLING --
  // Force update profile when returning from Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      console.log("Stripe Checkout Success Detected. Refreshing profile...");

      // 1. Invalidate Profile Query
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // 2. Show success message
      toast.success("Assinatura confirmada!", {
        description: "Seu plano foi atualizado com sucesso."
      });

      // 3. Clean URL
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newUrl }, "", newUrl);
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
          <Route path="/health" element={<ProtectedRoute><Layout><Health /></Layout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Layout><Notes /></Layout></ProtectedRoute>} />

          {/* Profile Pages wrapped in Layout too for consistency, or keep them standalone if preferred. 
              Let's wrap them for the "System" feel.
          */}
          <Route path="/profile/edit" element={<ProtectedRoute><Layout><ProfileEdit /></Layout></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Layout><Plans /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

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
