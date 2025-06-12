
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PhoneInputField from "./login/PhoneInputField";
import NameInputField from "./login/NameInputField";
import PinInput from "./login/PinInput";
import { useLoginLogic } from "./login/useLoginLogic";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; phone: string }) => void;
  businessSlug?: string;
  themeColor?: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  open, 
  onClose, 
  onLogin, 
  businessSlug,
  themeColor = "#9b87f5"
}) => {
  const {
    phone, setPhone,
    name, setName,
    pin, setPin,
    confirmPin, setConfirmPin,
    pinMode, existingUserData,
    isLoading, handleSubmit, resetForm
  } = useLoginLogic(businessSlug);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const onSubmitForm = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result?.success && result.userData) {
      onLogin(result.userData);
      onClose();
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processando...";
    if (pinMode === 'verify') return "Entrar";
    if (pinMode === 'create') return "Criar Conta";
    return "Continuar";
  };

  const getDialogTitle = () => {
    if (pinMode === 'verify') return "Acesse sua conta";
    if (pinMode === 'create') return existingUserData ? "Crie seu PIN" : "Criar conta";
    return "Acesse seus agendamentos";
  };

  const isFormValid = () => {
    if (!phone || phone.replace(/\D/g, '').length !== 11) return false;
    
    if (pinMode === 'verify') {
      return pin.length === 4;
    }
    
    if (pinMode === 'create') {
      const hasName = existingUserData?.name || name.trim().length >= 2;
      const hasPins = pin.length === 4 && confirmPin.length === 4;
      const pinsMatch = pin === confirmPin;
      return hasName && hasPins && pinsMatch;
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmitForm} className="space-y-6 mt-4">
          <PhoneInputField 
            phone={phone} 
            onChange={setPhone}
            isLoading={isLoading} 
          />
          
          {/* Show name field only for new users who don't have a name */}
          {pinMode === 'create' && !existingUserData?.name && (
            <NameInputField 
              name={name} 
              onChange={setName} 
              isLoading={isLoading}
              disabled={false}
            />
          )}
          
          {pinMode === 'verify' && (
            <>
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">
                  Bem-vindo de volta, {existingUserData?.name || 'usuário'}!
                </p>
              </div>
              <PinInput 
                mode="verify"
                pin={pin}
                onPinChange={setPin}
                isLoading={isLoading}
              />
            </>
          )}
          
          {pinMode === 'create' && (
            <>
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">
                  {existingUserData?.name 
                    ? `Olá ${existingUserData.name}, crie um PIN para acessar seus agendamentos`
                    : 'Vamos criar sua conta para gerenciar agendamentos'
                  }
                </p>
              </div>
              <PinInput 
                mode="create"
                pin={pin}
                confirmPin={confirmPin}
                onPinChange={setPin}
                onConfirmPinChange={setConfirmPin}
                isLoading={isLoading}
              />
            </>
          )}
          
          <Button
            type="submit"
            className="w-full text-white py-3 text-lg"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            disabled={isLoading || !isFormValid()}
          >
            {getButtonText()}
          </Button>
          
          {pinMode === 'create' && pin.length > 0 && confirmPin.length > 0 && pin !== confirmPin && (
            <p className="text-sm text-red-500 text-center">
              Os PINs não conferem
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
