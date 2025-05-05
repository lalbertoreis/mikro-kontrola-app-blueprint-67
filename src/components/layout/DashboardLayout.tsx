
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  Bell,
  UserPlus,
  WalletCards,
  CalendarRange,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();
  
  const navigationItems = [
    { name: "Dashboard", to: "/dashboard", icon: Home },
    { name: "Agenda", to: "/dashboard/calendar", icon: Calendar },
    { name: "Clientes", to: "/dashboard/clients", icon: Users },
    { name: "Serviços", to: "/dashboard/services", icon: CreditCard },
    { name: "Funcionários", to: "/dashboard/employees", icon: UserPlus },
    { name: "Feriados", to: "/dashboard/holidays", icon: CalendarRange },
    { name: "Financeiro", to: "/dashboard/finance", icon: WalletCards },
    { name: "Métodos de Pagamento", to: "/dashboard/payment-methods", icon: DollarSign },
    { name: "Custos Fixos", to: "/dashboard/fixed-costs", icon: CreditCard },
    { name: "Configurações", to: "/dashboard/settings", icon: Settings },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <SidebarContent 
            navigationItems={navigationItems} 
            currentPath={location.pathname} 
          />
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 flex z-40">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={toggleSidebar}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white animate-fade-in">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
                onClick={toggleSidebar}
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
            <SidebarContent 
              navigationItems={navigationItems} 
              currentPath={location.pathname} 
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {isMobile && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            
            {/* Add notification indicator and user profile */}
            <div className="ml-auto flex items-center space-x-4">
              <NotificationIndicator />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="font-medium">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="flex items-center">
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigationItems: {
    name: string;
    to: string;
    icon: React.ElementType;
  }[];
  currentPath: string;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigationItems, currentPath }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
          <span className="text-lg font-semibold text-kontrola-800">KontrolaApp</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.to;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? "bg-kontrola-50 text-kontrola-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-kontrola-600" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
