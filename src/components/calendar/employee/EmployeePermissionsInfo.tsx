
import React from "react";

const EmployeePermissionsInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Suas Permissões:</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Visualizar apenas seus próprios agendamentos</li>
        <li>• Acesso somente à agenda</li>
        <li>• Não é possível criar ou editar agendamentos</li>
      </ul>
    </div>
  );
};

export default EmployeePermissionsInfo;
