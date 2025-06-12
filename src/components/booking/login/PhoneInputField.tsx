
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
  // Format phone number for WhatsApp (Brazilian format)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and formatting characters
    const filteredValue = inputValue.replace(/[^\d\s()-]/g, '');
    onChange(formatPhoneNumber(filteredValue));
  };

  return (
    <div>
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
        Número do WhatsApp
      </label>
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={handleChange}
        className="w-full p-3 border rounded-md text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="(11) 99999-9999"
        disabled={isLoading}
        autoComplete="tel"
        required
        maxLength={15}
      />
      <p className="text-xs text-gray-500 mt-1">
        Digite seu número com DDD (apenas números)
      </p>
    </div>
  );
};

export default PhoneInputField;
