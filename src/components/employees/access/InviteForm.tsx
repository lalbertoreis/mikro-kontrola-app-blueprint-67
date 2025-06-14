
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Key } from "lucide-react";
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

const inviteSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  temporaryPassword: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

interface InviteFormProps {
  onSubmit: (data: { email: string; temporaryPassword: string }) => void;
  isCreating: boolean;
  defaultEmail?: string;
}

const InviteForm: React.FC<InviteFormProps> = ({ onSubmit, isCreating, defaultEmail = "" }) => {
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: defaultEmail,
      temporaryPassword: "",
    },
  });

  // Atualizar o email quando defaultEmail mudar
  useEffect(() => {
    if (defaultEmail) {
      form.setValue("email", defaultEmail);
    }
  }, [defaultEmail, form]);

  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue("temporaryPassword", password);
  };

  return (
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
                  className="w-full"
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
              <div className="flex flex-col sm:flex-row gap-2">
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Digite uma senha provisória" 
                    {...field}
                    className="flex-1"
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generatePassword}
                  size="sm"
                  className="w-full sm:w-auto"
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

        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            {isCreating && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar Convite
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InviteForm;
