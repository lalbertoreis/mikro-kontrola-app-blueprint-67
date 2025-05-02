
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HolidayFormComponent from "@/components/holidays/HolidayForm";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useHolidayById } from "@/hooks/useHolidays";
import { createHoliday, updateHoliday } from "@/services/holidayService";
import { HolidayFormData } from "@/types/holiday";
import { toast } from "sonner";

const HolidayForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  
  const { data: holiday, isLoading } = useHolidayById(id);

  const handleCancel = () => {
    navigate("/dashboard/holidays");
  };

  const handleSubmit = async (data: HolidayFormData) => {
    try {
      if (isEditing && id) {
        await updateHoliday(id, data);
        toast.success("Feriado atualizado com sucesso!");
      } else {
        await createHoliday(data);
        toast.success("Feriado adicionado com sucesso!");
      }
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      navigate("/dashboard/holidays");
    } catch (error) {
      console.error("Erro ao salvar feriado:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar feriado. Tente novamente."
          : "Erro ao adicionar feriado. Tente novamente."
      );
    }
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
