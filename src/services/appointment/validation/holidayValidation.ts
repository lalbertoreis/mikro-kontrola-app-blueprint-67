
import { Holiday } from "@/types/holiday";

export function validateHolidayBlocking(
  holidays: Holiday[],
  startTime: string,
  endTime: string
): { isBlocked: boolean; reason?: string } {
  for (const holiday of holidays) {
    if (!holiday.isActive) continue;
    
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    switch (holiday.blockingType) {
      case 'full_day':
        return {
          isBlocked: true,
          reason: `Agendamento bloqueado devido ao feriado: ${holiday.name}`
        };
        
      case 'morning':
        if (startHour < 12) {
          return {
            isBlocked: true,
            reason: `Agendamento bloqueado na manhã devido ao feriado: ${holiday.name}`
          };
        }
        break;
        
      case 'afternoon':
        if (startHour >= 12) {
          return {
            isBlocked: true,
            reason: `Agendamento bloqueado na tarde devido ao feriado: ${holiday.name}`
          };
        }
        break;
        
      case 'custom':
        if (holiday.customStartTime && holiday.customEndTime) {
          const [customStartHour, customStartMin] = holiday.customStartTime.split(':').map(Number);
          const [customEndHour, customEndMin] = holiday.customEndTime.split(':').map(Number);
          
          const appointmentStartMinutes = startHour * 60 + parseInt(startTime.split(':')[1]);
          const appointmentEndMinutes = endHour * 60 + parseInt(endTime.split(':')[1]);
          const customStartMinutes = customStartHour * 60 + customStartMin;
          const customEndMinutes = customEndHour * 60 + customEndMin;
          
          // Check if appointment overlaps with custom blocked time
          if (appointmentStartMinutes < customEndMinutes && appointmentEndMinutes > customStartMinutes) {
            return {
              isBlocked: true,
              reason: `Agendamento bloqueado devido ao feriado ${holiday.name} (${holiday.customStartTime} - ${holiday.customEndTime})`
            };
          }
        }
        break;
    }
  }
  
  return { isBlocked: false };
}
