
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

  // Check if user exists when phone number is complete
  useEffect(() => {
    const checkUser = async () => {
      if (phone && phone.replace(/\D/g, '').length === 11) {
        try {
          setIsLoading(true);
          const userData = await checkClientExists(phone, businessSlug);
          
          if (userData) {
            setName(userData.name || '');
            setExistingUserData(userData);
            setPinMode(userData.hasPin ? 'verify' : 'create');
          } else {
            setExistingUserData(null);
            setPinMode('create');
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await handleFormSubmission(
        phone,
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
    resetForm
  };
}
