
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Navbar from "@/components/layout/Navbar";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

// Páginas
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Clients from "@/pages/Clients";
import ClientForm from "@/pages/ClientForm";
import Employees from "@/pages/Employees";
import EmployeeForm from "@/pages/EmployeeForm";
import Services from "@/pages/Services";
import ServiceForm from "@/pages/ServiceForm";
import Calendar from "@/pages/Calendar";
import ServicePackages from "@/pages/ServicePackages";
import Finance from "@/pages/Finance";
import TransactionForm from "@/pages/TransactionForm";
import Holidays from "@/pages/Holidays";
import HolidayForm from "@/pages/HolidayForm";
import PaymentMethods from "@/pages/PaymentMethods";
import FixedCosts from "@/pages/FixedCosts";
import PublicBooking from "@/pages/PublicBooking";
import { Business404 } from "@/pages/Business404";
import Notifications from "@/pages/Notifications";

// Criando o cliente para o React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

// Layout component for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <OnboardingModal />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <Routes>
              {/* Rotas públicas com Navbar */}
              <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
              <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
              
              {/* Rotas de agenda online */}
              <Route path="/booking/:slug" element={<PublicBooking />} />
              <Route path="/booking/404" element={<Business404 />} />
              
              {/* Rotas de autenticação sem Navbar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
              <Route path="/dashboard/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
              <Route path="/dashboard/clients/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
              <Route path="/dashboard/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/dashboard/employees/new" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
              <Route path="/dashboard/employees/:id" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
              <Route path="/dashboard/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/dashboard/services/new" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
              <Route path="/dashboard/services/:id" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
              <Route path="/dashboard/service-packages" element={<ProtectedRoute><ServicePackages /></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/dashboard/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/dashboard/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
              <Route path="/dashboard/fixed-costs" element={<ProtectedRoute><FixedCosts /></ProtectedRoute>} />
              <Route path="/dashboard/finance/transaction/new" element={<ProtectedRoute><TransactionForm /></ProtectedRoute>} />
              <Route path="/dashboard/finance/transaction/:id" element={<ProtectedRoute><TransactionForm /></ProtectedRoute>} />
              <Route path="/dashboard/holidays" element={<ProtectedRoute><Holidays /></ProtectedRoute>} />
              <Route path="/dashboard/holidays/new" element={<ProtectedRoute><HolidayForm /></ProtectedRoute>} />
              <Route path="/dashboard/holidays/:id" element={<ProtectedRoute><HolidayForm /></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
