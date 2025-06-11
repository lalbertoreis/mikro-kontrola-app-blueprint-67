
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FixedCostList } from "@/components/finance/FixedCostList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FixedCosts: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Custos Fixos</h1>
            <p className="text-muted-foreground">
              Gerencie os custos fixos do seu estabelecimento.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custos Fixos</CardTitle>
            <CardDescription>
              Gerencie os custos fixos mensais do seu negócio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FixedCostList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FixedCosts;
