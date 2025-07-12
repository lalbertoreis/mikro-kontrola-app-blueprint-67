export interface EmployeeInvite {
  id: string;
  employee_id: string;
  email: string;
  temporary_password: string;
  is_active: boolean;
  created_at: string;
  activated_at?: string;
  user_id?: string;
}

export interface CreateInviteData {
  employeeId: string;
  email: string;
  temporaryPassword: string;
}