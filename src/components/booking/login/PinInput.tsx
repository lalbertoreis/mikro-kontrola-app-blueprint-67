
import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PinInputProps {
  mode: 'verify' | 'create';
  pin: string;
  confirmPin?: string;
  onPinChange: (value: string) => void;
  onConfirmPinChange?: (value: string) => void;
  isLoading: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ 
  mode, 
  pin, 
  confirmPin = '', 
  onPinChange, 
  onConfirmPinChange, 
  isLoading 
}) => {
  return (
    <>
      {mode === 'verify' ? (
        <div>
          <label htmlFor="verify-pin" className="block text-sm font-medium text-gray-700 mb-2">
            Digite seu PIN de acesso
          </label>
          <div className="flex justify-center my-4">
            <InputOTP 
              maxLength={4} 
              value={pin} 
              onChange={onPinChange}
              disabled={isLoading}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Digite o PIN de 4 dígitos que você criou anteriormente.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="create-pin" className="block text-sm font-medium text-gray-700 mb-2">
              Crie um PIN de acesso (4 dígitos)
            </label>
            <div className="flex justify-center my-4">
              <InputOTP 
                maxLength={4} 
                value={pin} 
                onChange={onPinChange}
                disabled={isLoading}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">
              Escolha um PIN numérico de 4 dígitos fácil de lembrar.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-700 mb-2">
              Confirme o PIN
            </label>
            <div className="flex justify-center my-4">
              <InputOTP 
                maxLength={4} 
                value={confirmPin} 
                onChange={onConfirmPinChange || (() => {})}
                disabled={isLoading}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Esse PIN será usado para acessar e gerenciar seus agendamentos futuramente.
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default PinInput;
