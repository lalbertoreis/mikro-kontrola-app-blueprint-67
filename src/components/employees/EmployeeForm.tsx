
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import EmployeeFormTabs from "./form/EmployeeFormTabs";
import EmployeeBasicInfoTab from "./form/EmployeeBasicInfoTab";
import EmployeeShiftsTab from "./form/EmployeeShiftsTab";
import EmployeeServicesTab from "./form/EmployeeServicesTab";
import EmployeeAccessFormTab from "./form/EmployeeAccessFormTab";
import { useEmployeeFormLogic } from "./form/useEmployeeFormLogic";

interface EmployeeFormProps {
  employeeId?: string;
  onSuccess: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const EmployeeForm = ({ employeeId, onSuccess, onSubmittingChange }: EmployeeFormProps) => {
  const {
    form,
    activeTab,
    setActiveTab,
    shifts,
    setShifts,
    selectedServices,
    setSelectedServices,
    isLoadingEmployee,
    isEditing,
    isCreating,
    isUpdating,
    onSubmit,
    goToNextStep,
    goToPreviousStep,
  } = useEmployeeFormLogic(employeeId, onSuccess, onSubmittingChange);

  if (isLoadingEmployee && isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando dados do funcionário...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <EmployeeFormTabs activeTab={activeTab} onTabChange={setActiveTab}>
          <TabsContent value="info" className="pt-4 pb-2">
            <EmployeeBasicInfoTab
              form={form}
              onNext={goToNextStep}
              onCancel={onSuccess}
            />
          </TabsContent>

          <TabsContent value="shifts" className="pt-4 pb-2">
            <EmployeeShiftsTab
              shifts={shifts}
              onChange={setShifts}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
            />
          </TabsContent>

          <TabsContent value="services" className="pt-4 pb-2">
            <EmployeeServicesTab
              selectedServices={selectedServices}
              onChange={setSelectedServices}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
            />
          </TabsContent>

          <EmployeeAccessFormTab
            employeeId={employeeId}
            onPrevious={goToPreviousStep}
            onSubmit={form.handleSubmit(onSubmit)}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isEditing={isEditing}
          />
        </EmployeeFormTabs>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
