
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Settings, 
  Bell,
  UserPlus,
  WalletCards,
  CalendarRange,
  DollarSign,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Menu,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useEmployeePermissions } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { signOut } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const { theme, toggleTheme, isLoading: themeLoading } = useThemeSettings();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  // Verificar se o usuário é funcionário
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const permissions = await checkEmployeePermissions();
        setIsEmployee(!!permissions);
        setEmployeeData(permissions);
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error);
        setIsEmployee(false);
      }
    };

    checkUserType();
  }, [checkEmployeePermissions]);

  // Menus para proprietários (completo)
  const ownerMenuCategories: MenuCategory[] = [
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

  // Menu simplificado para funcionários (apenas agenda)
  const employeeMenuCategories: MenuCategory[] = [
    {
      label: "Agenda",
      icon: Calendar,
      items: [
        { name: "Minha Agenda", to: "/employee/calendar", icon: Calendar },
      ]
    }
  ];

  // Escolher o menu baseado no tipo de usuário
  const menuCategories = isEmployee ? employeeMenuCategories : ownerMenuCategories;

  const handleLogout = () => {
    signOut();
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize if exceeding mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Menu lateral fixo no desktop, oculto no mobile */}
      <aside 
        className={`fixed md:sticky top-0 z-30 flex flex-col h-full w-64 min-w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Logo e título */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
            <span className="text-lg font-semibold text-kontrola-800 dark:text-white">KontrolaApp</span>
          </Link>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Informações do funcionário se aplicável */}
        {isEmployee && employeeData && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Funcionário: {employeeData.employee?.name}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Acesso restrito à agenda
            </p>
          </div>
        )}

        {/* Menu de navegação - usando ScrollArea do shadcn/ui */}
        <ScrollArea className="flex-1 overflow-hidden">
          <nav className="py-4">
            {menuCategories.map((category) => (
              <div key={category.label} className="px-3 mb-6">
                <div className="flex items-center mb-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <category.icon className="h-4 w-4 mr-2" />
                  <span>{category.label}</span>
                </div>
                <ul className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = location.pathname === item.to;
                    const menuId = item.to.split('/').pop();
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.to}
                          data-menu={menuId}
                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive 
                              ? "bg-kontrola-50 text-kontrola-700 font-medium dark:bg-gray-700 dark:text-kontrola-300" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer com opções de tema e logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <Button 
            variant="outline" 
            className="justify-start w-full" 
            onClick={toggleTheme}
            size="sm"
            disabled={themeLoading}
          >
            {themeLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            <span>
              {themeLoading 
                ? "Alterando..." 
                : theme === "dark" 
                  ? "Modo Claro" 
                  : "Modo Escuro"
              }
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start w-full text-red-500 hover:text-red-500 hover:border-red-200" 
            onClick={handleLogout}
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Área principal de conteúdo */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sticky top-0 z-20">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="md:hidden ml-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-kontrola-600 text-white font-bold text-xl p-1.5 rounded">K</div>
            </Link>
          </div>
          
          <div className="flex items-center ml-auto">
            {!isEmployee && <NotificationIndicator />}
          </div>
        </header>

        {/* Conteúdo principal - com sua própria scrollbar */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay para fechar menu no mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
