
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface EmployeeAccessDeniedProps {
  userId?: string;
  employeeData: any;
  accessDenied: boolean;
}

const EmployeeAccessDenied: React.FC<EmployeeAccessDeniedProps> = ({
  userId,
  employeeData,
  accessDenied,
}) => {
  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-left">
            <strong>Debug Info:</strong>
            <br />User ID: {userId}
            <br />Employee Data: {employeeData ? 'Present' : 'None'}
            <br />Access Denied: {accessDenied ? 'Yes' : 'No'}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EmployeeAccessDenied;
