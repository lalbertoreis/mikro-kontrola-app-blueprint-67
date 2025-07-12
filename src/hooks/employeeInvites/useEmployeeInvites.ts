import { useEmployeeInvitesQuery } from "./queries/useEmployeeInvitesQuery";
import { useCreateInvite } from "./mutations/useCreateInvite";
import { useResendInvite } from "./mutations/useResendInvite";
import { useDisableAccess } from "./mutations/useDisableAccess";
import { getInviteByEmployeeId } from "./utils/getInviteByEmployeeId";

export function useEmployeeInvites() {
  const { data: invites = [], isLoading } = useEmployeeInvitesQuery();
  const createMutation = useCreateInvite();
  const resendMutation = useResendInvite();
  const disableAccessMutation = useDisableAccess();

  return {
    invites,
    isLoading,
    createInvite: createMutation.mutate,
    isCreating: createMutation.isPending,
    resendInvite: resendMutation.mutate,
    isResending: resendMutation.isPending,
    disableAccess: disableAccessMutation.mutate,
    isDisabling: disableAccessMutation.isPending,
    getInviteByEmployeeId: (employeeId: string) => getInviteByEmployeeId(invites, employeeId),
  };
}