
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HolidayFormComponent from "@/components/holidays/HolidayForm";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const HolidayForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: holiday, isLoading } = useQuery({
    queryKey: ["holiday", id],
    queryFn: async () => {
      if (!id) return null;
      // Em uma implementação real, buscaríamos do backend
      return null;
    },
    enabled: isEditing,
  });

  const handleCancel = () => {
    navigate("/dashboard/holidays");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/holidays")} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEditing ? "Editar" : "Novo"} Feriado
              </h1>
              <p className="text-muted-foreground">
                {isEditing
                  ? "Altere as informações do feriado"
                  : "Adicione um novo feriado ao sistema"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <HolidayFormComponent 
            defaultValues={holiday} 
            onCancel={handleCancel} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default HolidayForm;
