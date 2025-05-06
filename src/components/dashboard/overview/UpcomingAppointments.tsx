
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentItem from "./AppointmentItem";

interface AppointmentData {
  client: string;
  service: string;
  time: string;
  date: string;
}

interface UpcomingAppointmentsProps {
  appointments: AppointmentData[];
}

const UpcomingAppointments = ({ appointments }: UpcomingAppointmentsProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
        <CardDescription>Seus compromissos para os próximos dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <AppointmentItem 
                key={index}
                client={appointment.client}
                service={appointment.service}
                time={appointment.time}
                date={appointment.date}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento próximo</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/dashboard/calendar" className="w-full">
          <Button variant="outline" className="w-full">Ver Agenda Completa</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default UpcomingAppointments;
