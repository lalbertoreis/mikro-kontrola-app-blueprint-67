
import React from "react";

interface NameInputFieldProps {
  name: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const NameInputField: React.FC<NameInputFieldProps> = ({ 
  name, 
  onChange, 
  isLoading, 
  disabled 
}) => {
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Nome completo
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Seu nome completo"
        disabled={isLoading || disabled}
        required
      />
    </div>
  );
};

export default NameInputField;
