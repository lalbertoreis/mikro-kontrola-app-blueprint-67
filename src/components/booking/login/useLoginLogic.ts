
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { checkClientExists } from "./clientVerification";
import { handleFormSubmission } from "./formSubmission";
import { ExistingUserData } from "./types";

export function useLoginLogic(businessSlug?: string) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [existingUserData, setExistingUserData] = useState<ExistingUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize phone to digits only for validation
  const normalizePhone = (phoneValue: string): string => {
    return phoneValue.replace(/\D/g, '');
  };

  // Validate phone format
  const isValidPhone = (phoneValue: string): boolean => {
    const digits = normalizePhone(phoneValue);
    return digits.length === 10 || digits.length === 11;
  };

  // Check if user exists when phone number is complete and valid
  useEffect(() => {
    const checkUser = async () => {
      const normalizedPhone = normalizePhone(phone);
      
      if (phone && isValidPhone(phone)) {
        try {
          setIsLoading(true);
          console.log("Checking client with normalized phone:", normalizedPhone);
          
          const userData = await checkClientExists(normalizedPhone, businessSlug);
          
          if (userData) {
            setName(userData.name || '');
            setExistingUserData(userData);
            setPinMode(userData.hasPin ? 'verify' : 'create');
            console.log("Client found:", userData);
          } else {
            setExistingUserData(null);
            setPinMode('create');
            console.log("New client");
          }
        } catch (err) {
          console.error('Error checking user:', err);
          toast.error("Erro ao verificar cadastro");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset data if phone is cleared or incomplete
        setPinMode(null);
        setExistingUserData(null);
      }
    };
    
    checkUser();
  }, [phone, businessSlug]);

  // Handle form submission with phone normalization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone before submission
    if (!isValidPhone(phone)) {
      toast.error("Por favor, insira um número de telefone válido");
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const normalizedPhone = normalizePhone(phone);
      console.log("Submitting with normalized phone:", normalizedPhone);
      
      const result = await handleFormSubmission(
        normalizedPhone, // Use normalized phone
        name,
        pin,
        confirmPin,
        pinMode,
        existingUserData,
        businessSlug
      );
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setPhone("");
    setName("");
    setPin("");
    setConfirmPin("");
    setPinMode(null);
    setExistingUserData(null);
  };

  return {
    phone,
    setPhone,
    name, 
    setName,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    pinMode,
    existingUserData,
    isLoading,
    handleSubmit,
    resetForm,
    isValidPhone: isValidPhone(phone),
    normalizedPhone: normalizePhone(phone)
  };
}
