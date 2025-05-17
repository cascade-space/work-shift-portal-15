
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductionProvider } from "./contexts/ProductionContext";

// Pages
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProductionReports from "./pages/ProductionReports";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeTasks from "./pages/EmployeeTasks";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/assign" element={<SupervisorDashboard />} />
              <Route path="/reports" element={<ProductionReports />} />
              <Route path="/tasks" element={<EmployeeTasks />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProductionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Router component to direct users to the appropriate dashboard based on role
const DashboardRouter = () => {
  const storedUser = localStorage.getItem('productionSystemUser');
  
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(storedUser);
  
  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Supervisor':
      return <SupervisorDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
