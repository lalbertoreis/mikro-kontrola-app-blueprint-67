
export function formatDayOfWeek(day: number): string {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
  ];
  
  return days[day] || "";
}

export function formatDateTime(date: string): string {
  if (!date) return "";
  
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  
  return new Date(date).toLocaleString("pt-BR", options);
}

export function formatDate(date: string): string {
  if (!date) return "";
  
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  };
  
  return new Date(date).toLocaleString("pt-BR", options);
}

export function formatTime(time: string): string {
  if (!time) return "";
  
  // Formato esperado: "HH:MM"
  return time;
}
