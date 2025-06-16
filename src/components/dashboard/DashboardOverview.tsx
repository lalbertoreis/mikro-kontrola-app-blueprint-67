
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedDashboardOverview from "./ProtectedDashboardOverview";

const DashboardOverview = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Você precisa estar logado para ver o dashboard.
      </div>
    );
  }

  return <ProtectedDashboardOverview />;
};

export default DashboardOverview;
