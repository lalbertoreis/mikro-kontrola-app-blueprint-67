
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import { useUpcomingAppointments } from "@/hooks/useDashboardAnalytics";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const UpcomingAppointmentsList = () => {
  const { data: appointments = [], isLoading } = useUpcomingAppointments(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum agendamento próximo
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 text-primary h-10 w-10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.employee_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(appointment.start_time), "HH:mm", { locale: ptBR })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(appointment.start_time), "dd/MM", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    R$ {Number(appointment.service_price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointmentsList;
