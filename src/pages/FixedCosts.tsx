
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FixedCostList } from "@/components/finance/FixedCostList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        
        <Card className="bg-background">
          <CardContent className="p-6">
            <FixedCostList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FixedCosts;
