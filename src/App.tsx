import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Finances from "./pages/Finances";
import CalendarPage from "./pages/CalendarPage";
import More from "./pages/More";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Books from "./pages/Books";
// import Notes from "./pages/Notes"; // Disabled for MVP

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppContent() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <PageTransition>
        <Routes>
          <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
          {/* <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} /> */}
          <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
      {user && !isLoading && (
        <BottomNav />
      )}

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
