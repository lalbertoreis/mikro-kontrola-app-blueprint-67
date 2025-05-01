
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="kontrola-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
              <span className="text-xl font-semibold text-kontrola-800">KontrolaApp</span>
            </Link>
          </div>
          
          {!isMobile ? (
            <nav className="flex space-x-8 items-center">
              <NavLinks />
              <AuthButtons />
            </nav>
          ) : (
            <div className="flex items-center">
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
        <div className="bg-white border-t border-gray-200 animate-fade-in">
          <div className="kontrola-container py-4 flex flex-col space-y-4">
            <NavLinks />
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLinks = () => (
  <>
    <Link to="/features" className="text-gray-700 hover:text-kontrola-600 font-medium">
      Recursos
    </Link>
    <Link to="/pricing" className="text-gray-700 hover:text-kontrola-600 font-medium">
      Preços
    </Link>
    <Link to="/about" className="text-gray-700 hover:text-kontrola-600 font-medium">
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

export default Navbar;
