import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientsPage from "./pages/Clients";
import PoliciesPage from "./pages/Policies";
import PipelinePage from "./pages/Pipeline";
import SchedulePage from "./pages/Schedule";
import CommissionsPage from "./pages/Commissions";
import MessagesPage from "./pages/Messages";
import TeamChatPage from "./pages/TeamChat";
import DocumentsPage from "./pages/Documents";
import ReportsPage from "./pages/Reports";
import CarriersPage from "./pages/Carriers";
import ProductsPage from "./pages/Products";
import LoginPage from "./pages/Login";
import SetupPage from "./pages/Setup";
import UserManagementPage from "./pages/UserManagement";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/setup" element={<PublicRoute><SetupPage /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
    <Route path="/policies" element={<ProtectedRoute><PoliciesPage /></ProtectedRoute>} />
    <Route path="/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
    <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
    <Route path="/commissions" element={<ProtectedRoute><CommissionsPage /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
    <Route path="/team-chat" element={<ProtectedRoute><TeamChatPage /></ProtectedRoute>} />
    <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
    <Route path="/carriers" element={<ProtectedRoute><CarriersPage /></ProtectedRoute>} />
    <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
    <Route path="/user-management" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

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
