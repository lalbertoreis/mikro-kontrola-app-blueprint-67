
import { useMemo } from "react";
import { Appointment, AppointmentWithDetails } from "@/types/calendar";

interface CalendarFiltersProps {
  appointments: Appointment[];
  selectedEmployee?: string;
  hideCanceled: boolean;
}

export function useFilteredAppointments({ appointments, selectedEmployee, hideCanceled }: CalendarFiltersProps) {
  return useMemo(() => {
    console.log("CalendarFilters - Input:", {
      totalAppointments: appointments.length,
      selectedEmployee,
      hideCanceled
    });

    // Filter appointments based on selected employee and canceled status
    const filteredAppointments = appointments.filter(appointment => {
      const matchesEmployee = !selectedEmployee || appointment.employeeId === selectedEmployee;
      const notCanceled = !hideCanceled || appointment.status !== 'canceled';
      
      console.log(`Appointment ${appointment.id}:`, {
        appointmentEmployeeId: appointment.employeeId,
        selectedEmployee,
        matchesEmployee,
        status: appointment.status,
        notCanceled,
        included: matchesEmployee && notCanceled
      });
      
      return matchesEmployee && notCanceled;
    });

    console.log("CalendarFilters - Output:", {
      filteredCount: filteredAppointments.length,
      appointmentIds: filteredAppointments.map(a => a.id)
    });

    // Convert Appointment[] to AppointmentWithDetails[] to match component props
    return filteredAppointments.map(appointment => ({
      ...appointment,
      employee: appointment.employee || {
        id: appointment.employeeId,
        name: 'Unknown Employee',
        role: '',
        shifts: [],
        services: [],
        createdAt: '',
        updatedAt: ''
      },
      service: appointment.service || {
        id: appointment.serviceId || '',
        name: 'Unknown Service',
        price: 0,
        duration: 0,
        multipleAttendees: false,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      },
      client: appointment.client || {
        id: appointment.clientId || '',
        name: 'Unknown Client',
        email: '',
        phone: '',
        cep: '',
        address: '',
        createdAt: '',
        updatedAt: ''
      }
    })) as AppointmentWithDetails[];
  }, [appointments, selectedEmployee, hideCanceled]);
}
