
import { supabase } from "@/integrations/supabase/client";

export async function validateEmployeeAvailability(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ isAvailable: boolean; reason?: string }> {
  try {
    const appointmentDate = new Date(`${date}T12:00:00`);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Buscar horário de trabalho do funcionário para este dia da semana
    const { data: shifts, error } = await supabase
      .from('employees_shifts_view')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);
    
    if (error) {
      console.error('Error fetching employee shifts:', error);
      return {
        isAvailable: false,
        reason: 'Erro ao verificar disponibilidade do profissional'
      };
    }
    
    if (!shifts || shifts.length === 0) {
      return {
        isAvailable: false,
        reason: 'Profissional não trabalha neste dia da semana'
      };
    }
    
    const shift = shifts[0];
    const [shiftStartHour, shiftStartMin] = shift.start_time.split(':').map(Number);
    const [shiftEndHour, shiftEndMin] = shift.end_time.split(':').map(Number);
    const [appointmentStartHour, appointmentStartMin] = startTime.split(':').map(Number);
    const [appointmentEndHour, appointmentEndMin] = endTime.split(':').map(Number);
    
    const shiftStartMinutes = shiftStartHour * 60 + shiftStartMin;
    const shiftEndMinutes = shiftEndHour * 60 + shiftEndMin;
    const appointmentStartMinutes = appointmentStartHour * 60 + appointmentStartMin;
    const appointmentEndMinutes = appointmentEndHour * 60 + appointmentEndMin;
    
    // Verificar se o agendamento está dentro do horário de trabalho
    if (appointmentStartMinutes < shiftStartMinutes || appointmentEndMinutes > shiftEndMinutes) {
      return {
        isAvailable: false,
        reason: `Profissional disponível apenas das ${shift.start_time} às ${shift.end_time} neste dia`
      };
    }
    
    return { isAvailable: true };
  } catch (error) {
    console.error('Error validating employee availability:', error);
    return {
      isAvailable: false,
      reason: 'Erro ao verificar disponibilidade do profissional'
    };
  }
}
