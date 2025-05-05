
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDayOfWeek } from "@/utils/dateUtils";
import { Shift } from "@/types/employee";
import { Clock, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ShiftSelectorProps {
  shifts: Shift[];
  onChange: (shifts: Shift[]) => void;
  showInlineErrors?: boolean;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, onChange, showInlineErrors = false }) => {
  const [newDay, setNewDay] = useState<string>("1"); // Segunda-feira como padrão
  const [newStart, setNewStart] = useState<string>("09:00");
  const [newEnd, setNewEnd] = useState<string>("18:00");

  // Verificar se já existe um turno para o dia selecionado com horários sobrepostos
  const checkOverlappingShifts = (shift: Shift): boolean => {
    return shifts.some((existingShift) => {
      if (existingShift.dayOfWeek !== shift.dayOfWeek) {
        return false;
      }

      const newStart = shift.startTime;
      const newEnd = shift.endTime;
      const existingStart = existingShift.startTime;
      const existingEnd = existingShift.endTime;

      // Verificar se os horários se sobrepõem
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const handleAddShift = () => {
    const newShift: Shift = {
      dayOfWeek: parseInt(newDay),
      startTime: newStart,
      endTime: newEnd,
    };

    // Verificar sobreposição antes de adicionar
    if (checkOverlappingShifts(newShift)) {
      toast.error("Já existe um turno com horários sobrepostos neste dia.");
      return;
    }

    onChange([...shifts, newShift]);
  };

  const handleRemoveShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    onChange(newShifts);
  };

  // Agrupar turnos por dia da semana para exibição
  const groupedShifts = shifts.reduce((acc, shift) => {
    const day = shift.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(shift);
    return acc;
  }, {} as Record<number, Shift[]>);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="day">Dia da Semana</Label>
            <Select value={newDay} onValueChange={setNewDay}>
              <SelectTrigger id="day" className="w-full">
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {formatDayOfWeek(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start-time">Hora Início</Label>
            <Input
              id="start-time"
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="end-time">Hora Fim</Label>
            <Input
              id="end-time"
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </div>
        </div>
        
        <Button
          type="button"
          onClick={handleAddShift}
          disabled={!newDay || !newStart || !newEnd}
          className="bg-primary hover:bg-primary/90 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Turno
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Turnos configurados:</h3>
        {shifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum turno adicionado</p>
        ) : (
          <ScrollArea className="h-[300px] max-h-[300px] overflow-y-auto pr-4">
            <div className="space-y-4 pr-2">
              {Object.entries(groupedShifts).map(([day, dayShifts]) => (
                <div key={day} className="space-y-2">
                  <h4 className="text-sm font-medium text-primary">
                    {formatDayOfWeek(parseInt(day))}
                  </h4>
                  {dayShifts.map((shift, index) => {
                    const shiftIndex = shifts.findIndex(
                      (s) => 
                        s.dayOfWeek === shift.dayOfWeek && 
                        s.startTime === shift.startTime && 
                        s.endTime === shift.endTime
                    );
                    
                    return (
                      <div
                        key={`${day}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveShift(shiftIndex)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ShiftSelector;
