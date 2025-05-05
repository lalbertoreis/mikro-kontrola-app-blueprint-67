
"use client"

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Desconectado com sucesso");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erro ao desconectar");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="kontrola-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
              <span className="text-xl font-semibold text-kontrola-800 dark:text-kontrola-300">KontrolaApp</span>
            </Link>
          </div>
          
          {!isMobile ? (
            <nav className="flex space-x-8 items-center">
              <NavLinks />
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                {user ? (
                  <UserMenu user={user} onLogout={handleLogout} />
                ) : (
                  <AuthButtons />
                )}
              </div>
            </nav>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="kontrola-container py-4 flex flex-col space-y-4">
            <NavLinks />
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <>
                  <Button 
                    variant="destructive" 
                    className="justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <AuthButtons />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLinks = () => (
  <>
    <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-kontrola-600 dark:hover:text-kontrola-400 font-medium">
      Recursos
    </Link>
    <Link to="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-kontrola-600 dark:hover:text-kontrola-400 font-medium">
      Preços
    </Link>
    <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-kontrola-600 dark:hover:text-kontrola-400 font-medium">
      Sobre
    </Link>
  </>
);

const AuthButtons = () => (
  <div className="flex space-x-4 items-center">
    <Link to="/login">
      <Button variant="ghost" className="font-medium">
        Entrar
      </Button>
    </Link>
    <Link to="/register">
      <Button className="bg-kontrola-600 hover:bg-kontrola-700">
        Comece Grátis
      </Button>
    </Link>
  </div>
);

const UserMenu = ({ user, onLogout }: { user: User, onLogout: () => void }) => (
  <div className="flex items-center space-x-4">
    <Link to="/dashboard">
      <Button variant="ghost" className="font-medium">
        Dashboard
      </Button>
    </Link>
    <Button variant="outline" onClick={onLogout} className="flex items-center">
      <LogOut className="mr-2 h-4 w-4" /> 
      Sair
    </Button>
  </div>
);

export default Navbar;
