
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeFormData, Shift } from "@/types/employee";

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (employeesError) throw employeesError;

    const employees = await Promise.all(employeesData.map(async employee => {
      // Fetch shifts for this employee
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', employee.id);
      
      if (shiftsError) throw shiftsError;

      // Fetch services for this employee
      const { data: servicesData, error: servicesError } = await supabase
        .from('employee_services')
        .select('service_id')
        .eq('employee_id', employee.id);
      
      if (servicesError) throw servicesError;

      const shifts: Shift[] = shiftsData.map(shift => ({
        dayOfWeek: shift.day_of_week,
        startTime: shift.start_time,
        endTime: shift.end_time,
        lunchBreakStart: undefined, // Adjust if your schema includes this
        lunchBreakEnd: undefined, // Adjust if your schema includes this
      }));

      const services = servicesData.map(service => service.service_id);

      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        shifts,
        services,
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      };
    }));
    
    return employees;
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    throw error;
  }
}

export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (employeeError) throw employeeError;
    if (!employee) return null;

    // Fetch shifts for this employee
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', id);
    
    if (shiftsError) throw shiftsError;

    // Fetch services for this employee
    const { data: servicesData, error: servicesError } = await supabase
      .from('employee_services')
      .select('service_id')
      .eq('employee_id', id);
    
    if (servicesError) throw servicesError;

    const shifts: Shift[] = shiftsData.map(shift => ({
      dayOfWeek: shift.day_of_week,
      startTime: shift.start_time,
      endTime: shift.end_time,
      lunchBreakStart: undefined, // Adjust if your schema includes this
      lunchBreakEnd: undefined, // Adjust if your schema includes this
    }));

    const services = servicesData.map(service => service.service_id);

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      shifts,
      services,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    throw error;
  }
}

export async function createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
  const { name, role, shifts, services } = employeeData;
  
  try {
    // Get user information for user_id field
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    // Start a Supabase transaction
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        name,
        role,
        user_id: userId
      })
      .select()
      .single();
    
    if (employeeError) throw employeeError;

    // Add shifts
    if (shifts.length > 0) {
      const shiftsToInsert = shifts.map(shift => ({
        employee_id: employee.id,
        day_of_week: shift.dayOfWeek,
        start_time: shift.startTime,
        end_time: shift.endTime,
        user_id: userId
      }));

      const { error: shiftsError } = await supabase
        .from('shifts')
        .insert(shiftsToInsert);
      
      if (shiftsError) throw shiftsError;
    }

    // Add services
    if (services.length > 0) {
      const servicesToInsert = services.map(serviceId => ({
        employee_id: employee.id,
        service_id: serviceId,
        user_id: userId
      }));

      const { error: servicesError } = await supabase
        .from('employee_services')
        .insert(servicesToInsert);
      
      if (servicesError) throw servicesError;
    }

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      shifts,
      services,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
}

export async function updateEmployee(id: string, employeeData: EmployeeFormData): Promise<Employee> {
  const { name, role, shifts, services } = employeeData;
  
  try {
    // Get user information for user_id field
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    // Update employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .update({
        name,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (employeeError) throw employeeError;

    // Delete existing shifts
    const { error: deleteShiftsError } = await supabase
      .from('shifts')
      .delete()
      .eq('employee_id', id);
    
    if (deleteShiftsError) throw deleteShiftsError;

    // Add new shifts
    if (shifts.length > 0) {
      const shiftsToInsert = shifts.map(shift => ({
        employee_id: id,
        day_of_week: shift.dayOfWeek,
        start_time: shift.startTime,
        end_time: shift.endTime,
        user_id: userId
      }));

      const { error: shiftsError } = await supabase
        .from('shifts')
        .insert(shiftsToInsert);
      
      if (shiftsError) throw shiftsError;
    }

    // Delete existing services
    const { error: deleteServicesError } = await supabase
      .from('employee_services')
      .delete()
      .eq('employee_id', id);
    
    if (deleteServicesError) throw deleteServicesError;

    // Add new services
    if (services.length > 0) {
      const servicesToInsert = services.map(serviceId => ({
        employee_id: id,
        service_id: serviceId,
        user_id: userId
      }));

      const { error: servicesError } = await supabase
        .from('employee_services')
        .insert(servicesToInsert);
      
      if (servicesError) throw servicesError;
    }

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      shifts,
      services,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    };
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    throw error;
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    // Delete employee (should cascade delete shifts and employee_services via foreign key constraints)
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    throw error;
  }
}
