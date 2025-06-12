
import React, { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  return (
    <>
      {mode === 'verify' ? (
        <div>
          <label htmlFor="verify-pin" className="block text-sm font-medium text-gray-700 mb-2">
            Digite seu PIN de acesso
          </label>
          <div className="space-y-3">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={4} 
                value={pin} 
                onChange={onPinChange}
                disabled={isLoading}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
              >
                <InputOTPGroup>
                  <InputOTPSlot 
                    index={0} 
                    className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                    style={!showPin ? { 
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc',
                      fontFamily: 'monospace'
                    } : {}}
                  />
                  <InputOTPSlot 
                    index={1} 
                    className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                    style={!showPin ? { 
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc',
                      fontFamily: 'monospace'
                    } : {}}
                  />
                  <InputOTPSlot 
                    index={2} 
                    className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                    style={!showPin ? { 
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc',
                      fontFamily: 'monospace'
                    } : {}}
                  />
                  <InputOTPSlot 
                    index={3} 
                    className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                    style={!showPin ? { 
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc',
                      fontFamily: 'monospace'
                    } : {}}
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showPin ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Ocultar PIN
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Mostrar PIN
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Digite o PIN de 4 dígitos que você criou anteriormente.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="create-pin" className="block text-sm font-medium text-gray-700 mb-2">
              Crie um PIN de acesso (4 dígitos)
            </label>
            <div className="space-y-3">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={4} 
                  value={pin} 
                  onChange={onPinChange}
                  disabled={isLoading}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                >
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={0} 
                      className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                      style={!showPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={1} 
                      className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                      style={!showPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={2} 
                      className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                      style={!showPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={3} 
                      className={`w-12 h-12 text-lg border-2 ${!showPin ? 'text-security-disc' : ''}`}
                      style={!showPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPin ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Ocultar PIN
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Mostrar PIN
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">
              Escolha um PIN numérico de 4 dígitos fácil de lembrar.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-700 mb-2">
              Confirme o PIN
            </label>
            <div className="space-y-3">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={4} 
                  value={confirmPin} 
                  onChange={onConfirmPinChange || (() => {})}
                  disabled={isLoading}
                  type={showConfirmPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                >
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={0} 
                      className={`w-12 h-12 text-lg border-2 ${!showConfirmPin ? 'text-security-disc' : ''}`}
                      style={!showConfirmPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={1} 
                      className={`w-12 h-12 text-lg border-2 ${!showConfirmPin ? 'text-security-disc' : ''}`}
                      style={!showConfirmPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={2} 
                      className={`w-12 h-12 text-lg border-2 ${!showConfirmPin ? 'text-security-disc' : ''}`}
                      style={!showConfirmPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                    <InputOTPSlot 
                      index={3} 
                      className={`w-12 h-12 text-lg border-2 ${!showConfirmPin ? 'text-security-disc' : ''}`}
                      style={!showConfirmPin ? { 
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc',
                        fontFamily: 'monospace'
                      } : {}}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPin ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Ocultar PIN
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Mostrar PIN
                    </>
                  )}
                </Button>
              </div>
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
