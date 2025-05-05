
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FixedCostList } from "@/components/finance/FixedCostList";

const FixedCosts: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custos Fixos</h1>
          <p className="text-muted-foreground">
            Gerencie os custos fixos do seu estabelecimento.
          </p>
        </div>
        
        <FixedCostList />
      </div>
    </DashboardLayout>
  );
};

export default FixedCosts;
