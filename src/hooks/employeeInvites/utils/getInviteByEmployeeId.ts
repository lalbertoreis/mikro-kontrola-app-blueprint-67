import { EmployeeInvite } from "../types";

export function getInviteByEmployeeId(invites: EmployeeInvite[], employeeId: string) {
  return invites.find(invite => invite.employee_id === employeeId);
}