
import React from "react";

interface PhoneInputFieldProps {
  phone: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({ 
  phone, 
  onChange, 
  isLoading 
}) => {
  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    
    return formatted;
  };

  return (
    <div>
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
        Telefone (WhatsApp)
      </label>
      <input
        id="phone"
        type="text"
        value={phone}
        onChange={(e) => onChange(formatPhoneNumber(e.target.value))}
        className="w-full p-2 border rounded-md"
        placeholder="(00) 00000-0000"
        disabled={isLoading}
        required
      />
    </div>
  );
};

export default PhoneInputField;
