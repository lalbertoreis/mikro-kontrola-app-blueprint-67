
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shift } from "@/types/employee";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const daysOfWeek = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

interface ShiftSelectorProps {
  shifts: Shift[];
  onChange: (shifts: Shift[]) => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, onChange }) => {
  const addShift = () => {
    onChange([
      ...shifts,
      {
        dayOfWeek: 1, // Segunda-feira como padrão
        startTime: "08:00",
        endTime: "18:00",
      },
    ]);
  };

  const removeShift = (index: number) => {
    const updatedShifts = [...shifts];
    updatedShifts.splice(index, 1);
    onChange(updatedShifts);
  };

  const updateShift = (index: number, field: keyof Shift, value: any) => {
    const updatedShifts = [...shifts];
    updatedShifts[index] = { ...updatedShifts[index], [field]: value };
    onChange(updatedShifts);
  };

  const toggleLunchBreak = (index: number, hasLunch: boolean) => {
    const updatedShifts = [...shifts];
    if (hasLunch) {
      updatedShifts[index] = {
        ...updatedShifts[index],
        lunchBreakStart: "12:00",
        lunchBreakEnd: "13:00",
      };
    } else {
      const { lunchBreakStart, lunchBreakEnd, ...rest } = updatedShifts[index];
      updatedShifts[index] = rest;
    }
    onChange(updatedShifts);
  };

  return (
    <div className="space-y-4">
      {shifts.map((shift, index) => (
        <Card key={index} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeShift(index)}
            className="absolute right-2 top-2"
            aria-label="Remover turno"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dia da semana</Label>
                <Select
                  value={shift.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    updateShift(index, "dayOfWeek", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Início</Label>
                  <Input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) =>
                      updateShift(index, "startTime", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Término</Label>
                  <Input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) =>
                      updateShift(index, "endTime", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start space-x-2">
              <Checkbox
                id={`lunch-${index}`}
                checked={!!shift.lunchBreakStart}
                onCheckedChange={(checked) =>
                  toggleLunchBreak(index, checked === true)
                }
              />
              <Label htmlFor={`lunch-${index}`} className="mt-0.5">
                Incluir pausa para almoço
              </Label>
            </div>

            {shift.lunchBreakStart && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Label>Início do almoço</Label>
                  <Input
                    type="time"
                    value={shift.lunchBreakStart}
                    onChange={(e) =>
                      updateShift(index, "lunchBreakStart", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Fim do almoço</Label>
                  <Input
                    type="time"
                    value={shift.lunchBreakEnd}
                    onChange={(e) =>
                      updateShift(index, "lunchBreakEnd", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={addShift}
        className="w-full flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Turno
      </Button>
    </div>
  );
};

export default ShiftSelector;
