
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only letters, spaces, and common accented characters
    const filteredValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    onChange(filteredValue);
  };

  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Nome completo
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={handleChange}
        className="w-full p-3 border rounded-md text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Seu nome completo"
        disabled={isLoading || disabled}
        autoComplete="name"
        required
        maxLength={100}
      />
      <p className="text-xs text-gray-500 mt-1">
        Como você gostaria de ser chamado(a)
      </p>
    </div>
  );
};

export default NameInputField;
