
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
import { X, Plus, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ShiftSelectorProps {
  shifts: Shift[];
  onChange: (shifts: Shift[]) => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, onChange }) => {
  const [newDay, setNewDay] = useState<string>("0");
  const [newStart, setNewStart] = useState<string>("09:00");
  const [newEnd, setNewEnd] = useState<string>("18:00");
  const [includeLunchBreak, setIncludeLunchBreak] = useState<boolean>(false);
  const [lunchStart, setLunchStart] = useState<string>("12:00");
  const [lunchEnd, setLunchEnd] = useState<string>("13:00");

  const handleAddShift = () => {
    const newShift: Shift = {
      dayOfWeek: parseInt(newDay),
      startTime: newStart,
      endTime: newEnd,
      lunchBreakStart: includeLunchBreak ? lunchStart : undefined,
      lunchBreakEnd: includeLunchBreak ? lunchEnd : undefined,
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
        
        <ScrollArea className="h-[200px] mb-6">
          <div className="grid grid-cols-7 gap-2">
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
                          {shift.lunchBreakStart && (
                            <div className="text-[10px] text-muted-foreground">
                              Almoço: {shift.lunchBreakStart} - {shift.lunchBreakEnd}
                            </div>
                          )}
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
        </ScrollArea>
        
        <Accordion type="single" collapsible defaultValue="turno">
          <AccordionItem value="turno">
            <AccordionTrigger>Adicionar Turno</AccordionTrigger>
            <AccordionContent>
              <div className="border rounded-lg p-4 space-y-4">
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

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="lunch-break"
                    checked={includeLunchBreak}
                    onCheckedChange={setIncludeLunchBreak}
                  />
                  <Label htmlFor="lunch-break">Incluir pausa para almoço</Label>
                </div>

                {includeLunchBreak && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="lunch-start">Início do Almoço</Label>
                      <Input
                        id="lunch-start"
                        type="time"
                        value={lunchStart}
                        onChange={(e) => setLunchStart(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lunch-end">Término do Almoço</Label>
                      <Input
                        id="lunch-end"
                        type="time"
                        value={lunchEnd}
                        onChange={(e) => setLunchEnd(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleAddShift}
                    disabled={!newDay || !newStart || !newEnd || (includeLunchBreak && (!lunchStart || !lunchEnd))}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Turno
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border rounded-lg p-4 mt-4">
        <h4 className="font-medium mb-4">Turnos Configurados</h4>
        <ScrollArea className="h-[200px]">
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
                  <div>
                    <div className="font-medium">{formatDayOfWeek(shift.dayOfWeek)}</div>
                    <div className="text-sm">{shift.startTime} - {shift.endTime}</div>
                    {shift.lunchBreakStart && (
                      <div className="text-xs text-muted-foreground">
                        Almoço: {shift.lunchBreakStart} - {shift.lunchBreakEnd}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveShift(index)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ShiftSelector;
