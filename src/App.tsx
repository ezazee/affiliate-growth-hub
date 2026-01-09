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
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAffiliators from "./pages/admin/AdminAffiliators";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCommissions from "./pages/admin/AdminCommissions";
import AffiliatorDashboard from "./pages/affiliator/AffiliatorDashboard";
import AffiliatorLinks from "./pages/affiliator/AffiliatorLinks";
import AffiliatorCommissions from "./pages/affiliator/AffiliatorCommissions";
import Checkout from "./pages/checkout/Checkout";
import InvalidAffiliate from "./pages/checkout/InvalidAffiliate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AffiliatorRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'affiliator') return <Navigate to="/" replace />;
  if (user?.status !== 'approved') return <Navigate to="/waiting-approval" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.status === 'approved') return <Navigate to="/affiliator" replace />;
    return <Navigate to="/waiting-approval" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/waiting-approval" element={<WaitingApproval />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/affiliators" element={<AdminRoute><AdminAffiliators /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/commissions" element={<AdminRoute><AdminCommissions /></AdminRoute>} />
      
      {/* Affiliator Routes */}
      <Route path="/affiliator" element={<AffiliatorRoute><AffiliatorDashboard /></AffiliatorRoute>} />
      <Route path="/affiliator/links" element={<AffiliatorRoute><AffiliatorLinks /></AffiliatorRoute>} />
      <Route path="/affiliator/commissions" element={<AffiliatorRoute><AffiliatorCommissions /></AffiliatorRoute>} />
      
      {/* Public Checkout */}
      <Route path="/checkout/:productSlug" element={<Checkout />} />
      <Route path="/invalid-affiliate" element={<InvalidAffiliate />} />
      
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
