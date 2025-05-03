
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useHolidays } from "@/hooks/useHolidays";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ImportHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportHolidaysDialog: React.FC<ImportHolidaysDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { importHolidays } = useHolidays();

  // Generate a list of years for the dropdown (current year + 5 years ahead + 2 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 8 },
    (_, i) => (currentYear - 2 + i).toString()
  );

  const handleImport = async () => {
    try {
      setImporting(true);
      setImportResult(null);
      
      // Use the importHolidays function from the hook
      await importHolidays(parseInt(selectedYear));
      
      setImportResult({
        success: true,
        message: `Feriados nacionais importados com sucesso para ${selectedYear}!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(`Feriados importados para ${selectedYear}.`);
    } catch (error) {
      console.error("Erro ao importar feriados:", error);
      setImportResult({
        success: false,
        message: error.message || "Erro ao importar feriados",
      });
      toast.error("Erro ao importar feriados. Verifique o console para mais detalhes.");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Feriados Nacionais</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">Selecione o ano</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {importing ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Importando feriados nacionais...</p>
            </div>
          ) : importResult ? (
            <div
              className={`p-4 rounded-md ${
                importResult.success
                  ? "bg-green-50 border border-green-200 text-green-900"
                  : "bg-red-50 border border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-center">
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                )}
                <p>{importResult.message}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>
                Esta ação importará todos os feriados nacionais do Brasil para o
                ano selecionado usando a BrasilAPI.
              </p>
              <p className="mt-2">
                Feriados com a mesma data serão atualizados automaticamente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResult ? "Fechar" : "Cancelar"}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={importing}>
              {importing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Importar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
