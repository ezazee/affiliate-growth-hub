import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WaitingApproval from "./pages/WaitingApproval";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AffiliatorDashboard from "./pages/affiliator/AffiliatorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Protected Route for Affiliator
function AffiliatorRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'affiliator') {
    return <Navigate to="/" replace />;
  }
  
  if (user?.status !== 'approved') {
    return <Navigate to="/waiting-approval" replace />;
  }
  
  return <>{children}</>;
}

// Auth Route - redirect if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.status === 'approved') {
      return <Navigate to="/affiliator" replace />;
    }
    return <Navigate to="/waiting-approval" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/waiting-approval" element={<WaitingApproval />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      
      {/* Affiliator Routes */}
      <Route path="/affiliator" element={<AffiliatorRoute><AffiliatorDashboard /></AffiliatorRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
