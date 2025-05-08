
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
  }, [open]);

  const onSubmitForm = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result?.success && result.userData) {
      onLogin(result.userData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Acesse seus agendamentos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmitForm} className="space-y-4 mt-4">
          <PhoneInputField 
            phone={phone} 
            onChange={setPhone}
            isLoading={isLoading} 
          />
          
          {/* Only show name field for new users */}
          {!existingUserData && (
            <NameInputField 
              name={name} 
              onChange={setName} 
              isLoading={isLoading}
              disabled={existingUserData?.name ? true : false}
            />
          )}
          
          {pinMode === 'verify' && (
            <PinInput 
              mode="verify"
              pin={pin}
              onPinChange={setPin}
              isLoading={isLoading}
            />
          )}
          
          {pinMode === 'create' && (
            <PinInput 
              mode="create"
              pin={pin}
              confirmPin={confirmPin}
              onPinChange={setPin}
              onConfirmPinChange={setConfirmPin}
              isLoading={isLoading}
            />
          )}
          
          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            disabled={isLoading || 
              !phone || 
              (!existingUserData && !name) ||
              (pinMode === 'verify' && pin.length !== 4) ||
              (pinMode === 'create' && (pin.length !== 4 || pin !== confirmPin))
            }
          >
            {isLoading ? "Processando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
