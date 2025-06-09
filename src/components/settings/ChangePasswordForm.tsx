
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const passwordSchemaWithoutCurrent = z.object({
  newPassword: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type PasswordFormDataWithoutCurrent = z.infer<typeof passwordSchemaWithoutCurrent>;

const ChangePasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { user } = useAuth();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const formWithoutCurrent = useForm<PasswordFormDataWithoutCurrent>({
    resolver: zodResolver(passwordSchemaWithoutCurrent),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Verificar se o usuário fez login pelo Google
    if (user) {
      const providers = user.app_metadata?.providers || [];
      setIsGoogleUser(providers.includes('google'));
    }
  }, [user]);

  const verifyCurrentPassword = async (currentPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      return !error;
    } catch (error) {
      return false;
    }
  };

  const onSubmitWithCurrent = async (data: PasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Verificar senha atual
      const isCurrentPasswordValid = await verifyCurrentPassword(data.currentPassword);
      
      if (!isCurrentPasswordValid) {
        toast.error("Senha atual incorreta.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Senha alterada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitWithoutCurrent = async (data: PasswordFormDataWithoutCurrent) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Senha alterada com sucesso!");
      formWithoutCurrent.reset();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <span>Alterar Senha</span>
        </CardTitle>
        <CardDescription>
          {isGoogleUser 
            ? "Defina uma senha para sua conta. Isso permitirá que você faça login com email e senha além do Google." 
            : "Altere sua senha para manter sua conta segura."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGoogleUser ? (
          <Form {...formWithoutCurrent}>
            <form onSubmit={formWithoutCurrent.handleSubmit(onSubmitWithoutCurrent)} className="space-y-4">
              <FormField
                control={formWithoutCurrent.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formWithoutCurrent.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Definindo..." : "Definir Senha"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitWithCurrent)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua senha atual"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
