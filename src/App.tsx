
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import ServicePackages from "./pages/ServicePackages";
import ClientForm from "./pages/ClientForm";
import ServiceForm from "./pages/ServiceForm";
import Employees from "./pages/Employees";
import EmployeeForm from "./pages/EmployeeForm";
import Finance from "./pages/Finance";
import TransactionForm from "./pages/TransactionForm";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Holidays from "./pages/Holidays";
import HolidayForm from "./pages/HolidayForm";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/clients" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/clients/new" element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/clients/:id" element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/services/packages" element={
              <ProtectedRoute>
                <ServicePackages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/services/new" element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/services/:id" element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/employees" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/employees/new" element={
              <ProtectedRoute>
                <EmployeeForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/employees/:id" element={
              <ProtectedRoute>
                <EmployeeForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance" element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance/new" element={
              <ProtectedRoute>
                <TransactionForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance/:id" element={
              <ProtectedRoute>
                <TransactionForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/holidays" element={
              <ProtectedRoute>
                <Holidays />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/holidays/new" element={
              <ProtectedRoute>
                <HolidayForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/holidays/:id" element={
              <ProtectedRoute>
                <HolidayForm />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
