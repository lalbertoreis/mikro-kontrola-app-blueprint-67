
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper function to format dates consistently
export const formatAppointmentDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Helper function to get date with period
export const getDateWithPeriod = (date: Date, period: string): string => {
  const formattedDate = format(date, 'dd/MM/yyyy', { locale: ptBR });
  return `${formattedDate} - ${period}`;
};
