
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

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
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/calendar" element={<Calendar />} />
                <Route path="/dashboard/clients" element={<Clients />} />
                <Route path="/dashboard/services" element={<Services />} />
                <Route path="/dashboard/settings" element={<Settings />} />
                <Route path="/dashboard/employees" element={<Employees />} />
                <Route path="/dashboard/finance" element={<Finance />} />
                <Route path="/dashboard/holidays" element={<Holidays />} />
                <Route path="/dashboard/notifications" element={<Notifications />} />
                <Route path="/dashboard/payment-methods" element={<PaymentMethods />} />
                <Route path="/dashboard/fixed-costs" element={<FixedCosts />} />
                <Route path="/dashboard/service-packages" element={<ServicePackages />} />
                <Route path="/booking/:slug" element={<PublicBooking />} />
                <Route path="/booking-not-found" element={<Business404 />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
