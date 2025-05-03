
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
import { X, Plus } from "lucide-react";

interface ShiftSelectorProps {
  shifts: Shift[];
  onChange: (shifts: Shift[]) => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, onChange }) => {
  const [newDay, setNewDay] = useState<string>("0");
  const [newStart, setNewStart] = useState<string>("09:00");
  const [newEnd, setNewEnd] = useState<string>("18:00");

  const handleAddShift = () => {
    const newShift: Shift = {
      dayOfWeek: parseInt(newDay),
      startTime: newStart,
      endTime: newEnd,
    };
    onChange([...shifts, newShift]);
  };

  const handleRemoveShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    onChange(newShifts);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Turnos de Trabalho</h3>
        
        <div className="grid grid-cols-7 gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const dayShifts = shifts.filter((shift) => shift.dayOfWeek === day);
            const isWorkingDay = dayShifts.length > 0;
            
            return (
              <div 
                key={day}
                className={`p-3 border rounded-md text-center ${
                  isWorkingDay 
                    ? "bg-green-100 border-green-300" 
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <div className="font-medium mb-1">{formatDayOfWeek(day)}</div>
                {dayShifts.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {dayShifts.map((shift, i) => (
                      <div key={i} className="bg-white p-1 rounded">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Folga</div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium mb-2">Adicionar Turno</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Dia da Semana</Label>
              <Select value={newDay} onValueChange={setNewDay}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {formatDayOfWeek(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Hora de Início</Label>
              <Input
                id="start-time"
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Hora de Término</Label>
              <Input
                id="end-time"
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddShift}
              disabled={!newDay || !newStart || !newEnd}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Turno
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 mt-4">
        <h4 className="font-medium mb-4">Turnos Configurados</h4>
        {shifts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Nenhum turno adicionado
          </div>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded bg-gray-50"
              >
                <span>
                  {formatDayOfWeek(shift.dayOfWeek)}: {shift.startTime} - {shift.endTime}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveShift(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftSelector;
