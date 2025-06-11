
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import NewHeroSection from "@/components/home/NewHeroSection";
import ModernFeaturesSection from "@/components/home/ModernFeaturesSection";
import ModernTestimonialsSection from "@/components/home/ModernTestimonialsSection";
import ModernPricingSection from "@/components/home/ModernPricingSection";
import ModernCTASection from "@/components/home/ModernCTASection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navbar fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="kontrola-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <div className="bg-kontrola-600 dark:bg-kontrola-500 text-white font-bold text-lg md:text-xl p-2 md:p-2.5 rounded-lg">K</div>
              <span className="text-xl md:text-2xl font-bold text-foreground">KontrolaApp</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Funcionalidades
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Depoimentos
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Preços
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 md:w-10 md:h-10"
              >
                <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>

              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-sm md:text-base">
                  Entrar
                </Button>
              </Link>

              <Link to="/register">
                <Button className="bg-kontrola-600 hover:bg-kontrola-700 dark:bg-kontrola-500 dark:hover:bg-kontrola-600 text-sm md:text-base px-3 md:px-4">
                  Começar Grátis
                  <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden w-9 h-9">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-16 md:pt-20">
        <NewHeroSection />
        <div id="features">
          <ModernFeaturesSection />
        </div>
        <div id="testimonials">
          <ModernTestimonialsSection />
        </div>
        <div id="pricing">
          <ModernPricingSection />
        </div>
        <ModernCTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
