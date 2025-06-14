
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import EmployeeRoute from "@/components/auth/EmployeeRoute";
import { OnboardingManager } from "@/components/onboarding/OnboardingManager";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Employees from "./pages/Employees";
import Finance from "./pages/Finance";
import Holidays from "./pages/Holidays";
import Notifications from "./pages/Notifications";
import PaymentMethods from "./pages/PaymentMethods";
import FixedCosts from "./pages/FixedCosts";
import PublicBooking from "./pages/PublicBooking";
import Business404 from "./pages/Business404";
import ServicePackages from "./pages/ServicePackages";
import EmployeeCalendarView from "./components/calendar/EmployeeCalendarView";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="kontrola-theme"
        >
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/booking/:slug" element={<PublicBooking />} />
                <Route path="/booking-not-found" element={<Business404 />} />
                
                {/* Employee routes - agenda restrita */}
                <Route path="/employee/calendar" element={
                  <EmployeeRoute>
                    <EmployeeCalendarView />
                  </EmployeeRoute>
                } />
                
                {/* Protected routes - apenas para proprietários */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/calendar" element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/clients" element={
                  <PrivateRoute>
                    <Clients />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/services" element={
                  <PrivateRoute>
                    <Services />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/employees" element={
                  <PrivateRoute>
                    <Employees />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/finance" element={
                  <PrivateRoute>
                    <Finance />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/holidays" element={
                  <PrivateRoute>
                    <Holidays />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/notifications" element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/payment-methods" element={
                  <PrivateRoute>
                    <PaymentMethods />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/fixed-costs" element={
                  <PrivateRoute>
                    <FixedCosts />
                  </PrivateRoute>
                } />
                <Route path="/dashboard/service-packages" element={
                  <PrivateRoute>
                    <ServicePackages />
                  </PrivateRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Onboarding Manager - aparece como overlay quando necessário */}
              <OnboardingManager />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
