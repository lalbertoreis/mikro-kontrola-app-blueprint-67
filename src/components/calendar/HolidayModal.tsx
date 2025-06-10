
import React from "react";
import { Holiday } from "@/types/holiday";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarX, Clock } from "lucide-react";

interface HolidayModalProps {
  holiday: Holiday | null;
  isOpen: boolean;
  onClose: () => void;
}

const HolidayModal: React.FC<HolidayModalProps> = ({ holiday, isOpen, onClose }) => {
  if (!holiday) return null;

  const getBlockingTypeText = () => {
    switch (holiday.blockingType) {
      case 'full_day':
        return 'Dia inteiro bloqueado';
      case 'morning':
        return 'Manhã bloqueada (até 12:00)';
      case 'afternoon':
        return 'Tarde bloqueada (após 12:00)';
      case 'custom':
        return `Horário personalizado: ${holiday.customStartTime} - ${holiday.customEndTime}`;
      default:
        return 'Sem bloqueio de agendamentos';
    }
  };

  const getBlockingColor = () => {
    switch (holiday.blockingType) {
      case 'full_day':
        return 'text-red-600 bg-red-50';
      case 'morning':
      case 'afternoon':
      case 'custom':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5 text-red-600" />
            {holiday.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="font-medium">{new Date(holiday.date).toLocaleDateString('pt-BR')}</p>
          </div>

          {holiday.description && (
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="text-sm">{holiday.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-sm capitalize">{holiday.type}</p>
          </div>

          <div className={`p-3 rounded-lg ${getBlockingColor()}`}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <p className="text-sm font-medium">{getBlockingTypeText()}</p>
            </div>
          </div>

          {holiday.blockingType !== 'none' && (
            <div className="text-xs text-muted-foreground">
              ⚠️ Agendamentos não poderão ser criados neste período
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;
