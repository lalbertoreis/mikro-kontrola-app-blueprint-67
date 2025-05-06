
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper function to format dates consistently
export const formatAppointmentDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};
