
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingSection from "@/components/home/PricingSection";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="kontrola-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Planos e Preços
              </h1>
              <p className="text-xl text-gray-600">
                Escolha o plano ideal para as necessidades do seu negócio
              </p>
            </div>
          </div>
        </div>
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
