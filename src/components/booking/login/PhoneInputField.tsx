
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
  // Normalize phone number to only digits
  const normalizePhone = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Format phone number for display (Brazilian format)
  const formatPhoneNumber = (value: string) => {
    const digits = normalizePhone(value);
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

  // Validate phone format in real-time
  const validatePhone = (digits: string): string | null => {
    if (digits.length === 0) {
      return null; // No error for empty field
    }
    
    if (digits.length < 10) {
      return "Telefone deve ter pelo menos 10 dígitos";
    }
    
    if (digits.length !== 10 && digits.length !== 11) {
      return "Telefone deve ter 10 ou 11 dígitos";
    }
    
    // Check if it starts with valid area code (11-99)
    if (digits.length >= 2) {
      const areaCode = parseInt(digits.slice(0, 2));
      if (areaCode < 11 || areaCode > 99) {
        return "Código de área inválido (11-99)";
      }
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers and formatting characters
    const filteredValue = inputValue.replace(/[^\d\s()-]/g, '');
    const normalizedValue = normalizePhone(filteredValue);
    
    // Limit to 11 digits maximum
    if (normalizedValue.length <= 11) {
      const formattedValue = formatPhoneNumber(filteredValue);
      onChange(formattedValue);
    }
  };

  const digits = normalizePhone(phone);
  const phoneError = validatePhone(digits);
  const isValid = digits.length >= 10 && digits.length <= 11 && !phoneError;

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
        className={`w-full p-3 border rounded-md text-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
          phoneError ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
        }`}
        placeholder="(11) 99999-9999"
        disabled={isLoading}
        autoComplete="tel"
        required
        maxLength={15}
      />
      
      {/* Real-time validation feedback */}
      <div className="mt-1 min-h-[1.25rem]">
        {phoneError && (
          <p className="text-xs text-red-500">{phoneError}</p>
        )}
        {!phoneError && digits.length > 0 && (
          <p className="text-xs text-gray-500">
            {isValid ? "✓ Número válido" : `${digits.length}/11 dígitos`}
          </p>
        )}
        {digits.length === 0 && (
          <p className="text-xs text-gray-500">
            Digite seu número com DDD (apenas números)
          </p>
        )}
      </div>
    </div>
  );
};

export default PhoneInputField;
