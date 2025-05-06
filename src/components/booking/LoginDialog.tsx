
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from "bcryptjs-react";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; phone: string }) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose, onLogin }) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [existingUserData, setExistingUserData] = useState<{ name?: string, hasPin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Check if user exists when phone number is complete
  useEffect(() => {
    const checkUserExists = async () => {
      if (phone && phone.replace(/\D/g, '').length === 11) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('clients')
            .select('name, pin')
            .eq('phone', phone)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking user:', error);
            return;
          }
          
          // If user exists
          if (data) {
            if (data.name) {
              setName(data.name);
            }
            
            // Check if user has a PIN
            setExistingUserData({ 
              name: data.name,
              hasPin: !!data.pin 
            });
            
            if (data.pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
          } else {
            setExistingUserData(null);
            setPinMode('create');
          }
        } catch (err) {
          console.error('Error in checkUserExists:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkUserExists();
  }, [phone]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!phone || phone.replace(/\D/g, '').length !== 11) {
        toast.error("Por favor, insira um número de telefone válido");
        return;
      }
      
      if (!existingUserData && !name) {
        toast.error("Por favor, insira seu nome");
        return;
      }
      
      // PIN validation
      if (pinMode === 'verify') {
        // Check PIN
        const { data, error } = await supabase
          .from('clients')
          .select('pin')
          .eq('phone', phone)
          .single();
          
        if (error) {
          toast.error("Erro ao verificar PIN");
          return;
        }
        
        // Compare PIN with stored hash
        const pinMatch = await bcrypt.compare(pin, data.pin);
        if (!pinMatch) {
          toast.error("PIN incorreto");
          return;
        }
      } else if (pinMode === 'create') {
        // Creating new PIN
        if (pin.length !== 4) {
          toast.error("O PIN deve ter 4 dígitos");
          return;
        }
        
        if (pin !== confirmPin) {
          toast.error("Os PINs não conferem");
          return;
        }
        
        // Hash the PIN
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(pin, saltRounds);
        
        // Check if user exists
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();
          
        if (existingClient) {
          // Update existing client with PIN
          await supabase
            .from('clients')
            .update({ 
              pin: hashedPin,
              name: name || existingClient.name
            })
            .eq('id', existingClient.id);
        } else {
          // Create new client with PIN
          await supabase
            .from('clients')
            .insert([
              { 
                name, 
                phone,
                pin: hashedPin,
                user_id: (await supabase.auth.getUser()).data.user?.id || undefined
              }
            ]);
        }
      }
      
      // Call login function with user data
      onLogin({ 
        name: name || existingUserData?.name || "Usuário", 
        phone 
      });
      
      // Close the dialog
      onClose();
      
    } catch (error) {
      console.error('Error in login process:', error);
      toast.error("Erro ao processar o login");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setPhone("");
      setName("");
      setPin("");
      setConfirmPin("");
      setPinMode(null);
      setExistingUserData(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Acesse seus agendamentos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone (WhatsApp)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              className="w-full p-2 border rounded-md"
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          {!existingUserData && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}
          
          {pinMode === 'verify' && (
            <div>
              <label htmlFor="verify-pin" className="block text-sm font-medium text-gray-700 mb-1">
                Digite seu PIN de acesso
              </label>
              <input
                id="verify-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
                placeholder="••••"
                required
              />
            </div>
          )}
          
          {pinMode === 'create' && (
            <>
              <div>
                <label htmlFor="create-pin" className="block text-sm font-medium text-gray-700 mb-1">
                  Crie um PIN de acesso (4 dígitos)
                </label>
                <input
                  id="create-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirme o PIN
                </label>
                <input
                  id="confirm-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
                  placeholder="••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esse PIN será usado para acessar e gerenciar seus agendamentos futuramente.
                </p>
              </div>
            </>
          )}
          
          <Button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
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
