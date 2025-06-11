
import React from "react";
import Footer from "@/components/layout/Footer";
import NewHeroSection from "@/components/home/NewHeroSection";
import ModernFeaturesSection from "@/components/home/ModernFeaturesSection";
import ModernTestimonialsSection from "@/components/home/ModernTestimonialsSection";
import ModernPricingSection from "@/components/home/ModernPricingSection";
import ModernCTASection from "@/components/home/ModernCTASection";

const Index = () => {
  return (
    <>
      <NewHeroSection />
      <ModernFeaturesSection />
      <ModernTestimonialsSection />
      <ModernPricingSection />
      <ModernCTASection />
      <Footer />
    </>
  );
};

export default Index;
