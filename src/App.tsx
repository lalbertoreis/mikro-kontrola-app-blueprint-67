
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard/clients" element={<Clients />} />
        <Route path="/dashboard/clients/new" element={<ClientForm />} />
        <Route path="/dashboard/clients/:id" element={<ClientForm />} />
        <Route path="/dashboard/services" element={<Services />} />
        <Route path="/dashboard/services/packages" element={<ServicePackages />} />
        <Route path="/dashboard/services/new" element={<ServiceForm />} />
        <Route path="/dashboard/services/:id" element={<ServiceForm />} />
        <Route path="/dashboard/employees" element={<Employees />} />
        <Route path="/dashboard/employees/new" element={<EmployeeForm />} />
        <Route path="/dashboard/employees/:id" element={<EmployeeForm />} />
        <Route path="/dashboard/finance" element={<Finance />} />
        <Route path="/dashboard/finance/new" element={<TransactionForm />} />
        <Route path="/dashboard/finance/:id" element={<TransactionForm />} />
        <Route path="/dashboard/calendar" element={<Calendar />} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
