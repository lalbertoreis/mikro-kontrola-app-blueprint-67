
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";

const EmployeeLoginLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <CalendarIcon className="h-12 w-12 text-kontrola-600" />
                <Loader2 className="h-4 w-4 animate-spin absolute -top-1 -right-1 text-kontrola-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Carregando sua agenda...
              </h2>
              <p className="text-sm text-gray-600">
                Aguarde enquanto preparamos suas informações
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-kontrola-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-kontrola-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-kontrola-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLoginLoading;
