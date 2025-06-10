
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Filter, Users, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types/employee";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarSidebarProps {
  view: CalendarViewOptions["view"];
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  employees: Employee[];
  selectedEmployeeId?: string;
  onEmployeeChange: (employeeId?: string) => void;
  hideCanceled: boolean;
  onToggleHideCanceled: () => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  onGoToToday: () => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  view,
  onViewChange,
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  hideCanceled,
  onToggleHideCanceled,
  onNewAppointment,
  onBlockTime,
  onGoToToday,
}) => {
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Controles da Agenda
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Ações principais */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Ações
          </h4>
          <div className="space-y-2">
            <Button 
              onClick={onNewAppointment}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
            
            <Button 
              onClick={onBlockTime}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Bloquear Horário
            </Button>
            
            <Button 
              onClick={onGoToToday}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ir para Hoje
            </Button>
          </div>
        </div>

        <Separator />

        {/* Visualização */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Visualização
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo de Exibição</Label>
              <Select value={view} onValueChange={(v) => onViewChange(v as "week" | "month")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Visualização Semanal</SelectItem>
                  <SelectItem value="month">Visualização Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Switch 
                id="hide-canceled" 
                checked={hideCanceled} 
                onCheckedChange={onToggleHideCanceled}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label 
                htmlFor="hide-canceled"
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                {hideCanceled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Ocultar Cancelados
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Filtros */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </h4>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Funcionário</Label>
            <Select 
              value={selectedEmployeeId || "all"} 
              onValueChange={(value) => onEmployeeChange(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedEmployee ? selectedEmployee.name : "Todos Funcionários"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Todos Funcionários
                  </div>
                </SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Legenda de status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Legenda
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Cancelado/Bloqueado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
