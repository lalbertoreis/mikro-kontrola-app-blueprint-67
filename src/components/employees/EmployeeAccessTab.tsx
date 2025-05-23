
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Key, CheckCircle, AlertCircle, Shield } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useEmployeeInvites } from "@/hooks/useEmployeeInvites";

const inviteSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  temporaryPassword: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

interface EmployeeAccessTabProps {
  employeeId?: string;
}

const EmployeeAccessTab: React.FC<EmployeeAccessTabProps> = ({ employeeId }) => {
  const { createInvite, isCreating, getInviteByEmployeeId } = useEmployeeInvites();
  const [inviteCreated, setInviteCreated] = useState(false);
  const [accessEnabled, setAccessEnabled] = useState(false);
  
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      temporaryPassword: "",
    },
  });

  const existingInvite = employeeId ? getInviteByEmployeeId(employeeId) : null;

  const onSubmit = async (data: z.infer<typeof inviteSchema>) => {
    if (!employeeId) {
      toast.error("É necessário salvar o funcionário primeiro");
      return;
    }

    if (!accessEnabled) {
      toast.error("Habilite o acesso ao painel primeiro");
      return;
    }

    try {
      await createInvite({
        employeeId,
        email: data.email,
        temporaryPassword: data.temporaryPassword,
      });
      
      setInviteCreated(true);
      form.reset();
      toast.success("Convite enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      toast.error("Erro ao enviar convite. Tente novamente.");
    }
  };

  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue("temporaryPassword", password);
  };

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Salve o funcionário primeiro</h3>
              <p className="text-sm text-muted-foreground">
                Para dar acesso ao painel, é necessário salvar as informações do funcionário primeiro.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingInvite && accessEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Acesso Configurado
          </CardTitle>
          <CardDescription>
            O funcionário já possui acesso ao painel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Acesso ao Painel</span>
            </div>
            <Switch 
              checked={accessEnabled} 
              onCheckedChange={setAccessEnabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{existingInvite.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2">
                <Badge variant={existingInvite.is_active ? "default" : "secondary"}>
                  {existingInvite.is_active ? "Ativo" : "Pendente"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Permissões do Funcionário:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Acesso apenas à agenda</li>
              <li>• Visualização apenas dos próprios agendamentos</li>
              <li>• Não pode criar ou editar agendamentos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Dar Acesso ao Painel
        </CardTitle>
        <CardDescription>
          Configure o acesso do funcionário ao painel administrativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Switch para habilitar/desabilitar acesso */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium">Habilitar Acesso ao Painel</span>
              <p className="text-xs text-muted-foreground">
                Permite que o funcionário acesse o sistema
              </p>
            </div>
          </div>
          <Switch 
            checked={accessEnabled} 
            onCheckedChange={setAccessEnabled}
          />
        </div>

        {accessEnabled && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email do Funcionário
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="funcionario@exemplo.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temporaryPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Senha Provisória
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Digite uma senha provisória" 
                          {...field} 
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generatePassword}
                        size="sm"
                      >
                        Gerar
                      </Button>
                    </div>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      O funcionário deverá alterar esta senha no primeiro acesso
                    </p>
                  </FormItem>
                )}
              />

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-amber-900 mb-2">O funcionário terá acesso a:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Agenda (apenas visualização)</li>
                  <li>• Seus próprios agendamentos</li>
                  <li>• Não poderá criar ou editar agendamentos</li>
                  <li>• Não terá acesso a outras áreas do sistema</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar Convite
                </Button>
              </div>
            </form>
          </Form>
        )}

        {!accessEnabled && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Habilite o acesso ao painel para configurar as credenciais do funcionário
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeAccessTab;
