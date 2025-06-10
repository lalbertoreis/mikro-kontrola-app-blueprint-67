
import React from "react";

const AccessPermissionsInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Permissões do Funcionário:</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Acesso apenas à agenda</li>
        <li>• Visualização apenas dos próprios agendamentos</li>
        <li>• Não pode criar ou editar agendamentos</li>
      </ul>
    </div>
  );
};

export default AccessPermissionsInfo;
