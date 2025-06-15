
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

  // Normalize phone to digits only for validation and API calls
  const normalizePhone = (phoneValue: string): string => {
    const digitsOnly = phoneValue.replace(/\D/g, '');
    console.log("normalizePhone - Input:", phoneValue, "Output:", digitsOnly);
    return digitsOnly;
  };

  // Validate phone format (must be exactly 11 digits)
  const isValidPhone = (phoneValue: string): boolean => {
    const digits = normalizePhone(phoneValue);
    const isValid = digits.length === 11;
    console.log("isValidPhone - Phone:", phoneValue, "Digits:", digits, "Valid:", isValid);
    return isValid;
  };

  // Check if user exists when phone number is complete and valid
  useEffect(() => {
    const checkUser = async () => {
      const normalizedPhone = normalizePhone(phone);
      
      console.log("useLoginLogic - checkUser called with:", {
        rawPhone: phone,
        normalizedPhone,
        isValid: isValidPhone(phone)
      });
      
      if (phone && isValidPhone(phone)) {
        try {
          setIsLoading(true);
          console.log("useLoginLogic - Checking client with normalized phone:", normalizedPhone);
          
          // Pass the normalized phone (digits only) to the check function
          const userData = await checkClientExists(normalizedPhone, businessSlug);
          
          if (userData) {
            setName(userData.name || '');
            setExistingUserData(userData);
            setPinMode(userData.hasPin ? 'verify' : 'create');
            console.log("useLoginLogic - Client found:", userData);
          } else {
            setExistingUserData(null);
            setPinMode('create');
            console.log("useLoginLogic - New client");
          }
        } catch (err) {
          console.error('useLoginLogic - Error checking user:', err);
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

  // Handle form submission with enhanced phone normalization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedPhone = normalizePhone(phone);
    
    console.log("useLoginLogic - handleSubmit called with:", {
      rawPhone: phone,
      normalizedPhone,
      phoneLength: normalizedPhone.length,
      isValid: isValidPhone(phone)
    });
    
    // Enhanced validation - only accept 11 digits
    if (!isValidPhone(phone)) {
      console.error("useLoginLogic - Invalid phone format:", {
        phone,
        normalizedPhone,
        length: normalizedPhone.length
      });
      toast.error("Por favor, insira um número de telefone válido com 11 dígitos (DDD + número)");
      return null;
    }
    
    setIsLoading(true);
    
    try {
      console.log("useLoginLogic - Submitting with normalized phone:", normalizedPhone);
      
      const result = await handleFormSubmission(
        normalizedPhone, // Use normalized phone (digits only)
        name,
        pin,
        confirmPin,
        pinMode,
        existingUserData,
        businessSlug
      );
      
      console.log("useLoginLogic - Form submission result:", result);
      return result;
    } catch (error) {
      console.error("useLoginLogic - Error in form submission:", error);
      throw error;
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
