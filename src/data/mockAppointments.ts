
import { AppointmentWithDetails } from "@/types/calendar";

// Helper function to create dates relative to today
const relativeDate = (dayOffset: number, hour: number, minute: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Create end time based on duration in minutes
const getEndTime = (start: Date, durationMinutes: number) => {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  return end;
};

export const mockAppointments: AppointmentWithDetails[] = [
  {
    id: "1",
    title: "Corte de Cabelo - João Silva",
    start: relativeDate(0, 10, 0),
    end: getEndTime(relativeDate(0, 10, 0), 30),
    employeeId: "1",
    serviceId: "1",
    clientId: "101",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employee: {
      id: "1",
      name: "João Silva",
      role: "Barbeiro",
      shifts: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "18:00", lunchBreakStart: "12:00", lunchBreakEnd: "13:00" },
      ],
      services: ["1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    service: {
      id: "1",
      name: "Corte de Cabelo",
      description: "Corte tradicional masculino",
      price: 50,
      duration: 30,
      multipleAttendees: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    client: {
      id: "101",
      name: "Carlos Mendes",
      email: "carlos@example.com",
      phone: "11987654321",
      birthDate: "1985-06-10",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "2",
    title: "Manicure - Maria Souza",
    start: relativeDate(0, 14, 0),
    end: getEndTime(relativeDate(0, 14, 0), 60),
    employeeId: "2",
    serviceId: "2",
    clientId: "102",
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employee: {
      id: "2",
      name: "Maria Souza",
      role: "Manicure",
      shifts: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      ],
      services: ["2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    service: {
      id: "2",
      name: "Manicure",
      description: "Manicure completa com esmaltação",
      price: 45,
      duration: 60,
      multipleAttendees: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    client: {
      id: "102",
      name: "Ana Paula",
      email: "ana@example.com",
      phone: "11912345678",
      birthDate: "1990-03-15",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "3",
    title: "Corte de Cabelo - João Silva",
    start: relativeDate(1, 11, 0),
    end: getEndTime(relativeDate(1, 11, 0), 30),
    employeeId: "1",
    serviceId: "1",
    clientId: "103",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employee: {
      id: "1",
      name: "João Silva",
      role: "Barbeiro",
      shifts: [
        { dayOfWeek: 2, startTime: "08:00", endTime: "18:00", lunchBreakStart: "12:00", lunchBreakEnd: "13:00" },
      ],
      services: ["1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    service: {
      id: "1",
      name: "Corte de Cabelo",
      description: "Corte tradicional masculino",
      price: 50,
      duration: 30,
      multipleAttendees: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    client: {
      id: "103",
      name: "Pedro Santos",
      email: "pedro@example.com",
      phone: "1199876543",
      birthDate: "1982-11-20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "4",
    title: "Manicure - Maria Souza",
    start: relativeDate(2, 15, 30),
    end: getEndTime(relativeDate(2, 15, 30), 60),
    employeeId: "2",
    serviceId: "2",
    clientId: "104",
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employee: {
      id: "2",
      name: "Maria Souza",
      role: "Manicure",
      shifts: [
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      ],
      services: ["2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    service: {
      id: "2",
      name: "Manicure",
      description: "Manicure completa com esmaltação",
      price: 45,
      duration: 60,
      multipleAttendees: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    client: {
      id: "104",
      name: "Juliana Lima",
      email: "juliana@example.com",
      phone: "11955443322",
      birthDate: "1995-08-05",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
];
