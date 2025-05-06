
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Calendar, 
  CreditCard, 
  Bell,
  UserPlus,
  WalletCards,
  CalendarRange,
  DollarSign,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type MenuCategory = {
  label: string;
  icon: React.ElementType;
  items: {
    name: string;
    to: string;
    icon: React.ElementType;
  }[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const menuCategories: MenuCategory[] = [
    {
      label: "Principal",
      icon: Home,
      items: [
        { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { name: "Agenda", to: "/dashboard/calendar", icon: Calendar },
        { name: "Notificações", to: "/dashboard/notifications", icon: Bell },
      ]
    },
    {
      label: "Cadastros",
      icon: Users,
      items: [
        { name: "Clientes", to: "/dashboard/clients", icon: Users },
        { name: "Serviços", to: "/dashboard/services", icon: CreditCard },
        { name: "Funcionários", to: "/dashboard/employees", icon: UserPlus },
        { name: "Feriados", to: "/dashboard/holidays", icon: CalendarRange },
      ]
    },
    {
      label: "Financeiro",
      icon: DollarSign,
      items: [
        { name: "Financeiro", to: "/dashboard/finance", icon: WalletCards },
        { name: "Métodos de Pagamento", to: "/dashboard/payment-methods", icon: DollarSign },
        { name: "Custos Fixos", to: "/dashboard/fixed-costs", icon: CreditCard },
      ]
    },
    {
      label: "Configuração",
      icon: Settings,
      items: [
        { name: "Configurações", to: "/dashboard/settings", icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center h-16 px-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
                <span className="text-lg font-semibold text-kontrola-800 dark:text-white">KontrolaApp</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {menuCategories.map((category) => (
              <SidebarGroup key={category.label}>
                <SidebarGroupLabel>
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => {
                      const isActive = location.pathname === item.to;
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton isActive={isActive} asChild tooltip={item.name}>
                            <Link to={item.to}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2 flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={toggleTheme}
                size="sm"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start text-red-500 hover:text-red-500 hover:border-red-200" 
                onClick={handleLogout}
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sair</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
            <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
              <div className="flex items-center">
                <SidebarTrigger />
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationIndicator />
              </div>
            </div>
          </header>

          <main className="overflow-auto flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
