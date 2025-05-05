import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useClients, useClientById } from "@/hooks/useClients";
import { Client, ClientFormData } from "@/types/client";
import { fetchAddressFromCEP } from "@/utils/cepUtils";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido.",
  }),
  cep: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

interface ClientFormProps {
  client?: Client | null;
  onFormChange?: () => void;
  onClose?: () => void;
  onSubmit?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onFormChange,
  onClose,
  onSubmit,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEditing = Boolean(client?.id || id);
  const isInDialogMode = Boolean(onClose); // Check if being used in a dialog
  const { createClient, updateClient, isCreating, isUpdating } = useClients();
  const [isFetchingAddress, setIsFetchingAddress] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cep: "",
      address: "",
      notes: "",
    },
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (client && isEditing) {
      form.reset({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        cep: client.cep || "",
        address: client.address || "",
        notes: client.notes || "",
      });
    }
  }, [client, form, isEditing]);

  // Notify parent about form changes
  const handleFormChange = () => {
    if (onFormChange) {
      onFormChange();
    }
  };

  // Set up the form change watcher
  useEffect(() => {
    const subscription = form.watch(() => handleFormChange());
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  const handleCEPChange = async (cep: string) => {
    if (cep.length === 9) { // Format: 12345-678
      setIsFetchingAddress(true);
      try {
        const addressData = await fetchAddressFromCEP(cep);
        if (addressData) {
          const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;
          form.setValue("address", fullAddress);
          handleFormChange();
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
      } finally {
        setIsFetchingAddress(false);
      }
    }
  };

  // Format CEP as user types (12345-678)
  const handleCEPFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    
    form.setValue("cep", value);
    if (value.length === 9) {
      handleCEPChange(value);
    }
  };

  const onSubmitForm = async (values: z.infer<typeof formSchema>) => {
    try {
      // Notify parent component that form is being submitted
      if (onSubmit) {
        onSubmit();
      }
      
      const clientData: ClientFormData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        cep: values.cep || "",
        address: values.address || "",
        notes: values.notes,
      };

      if (isEditing && (client?.id || id)) {
        const clientId = client?.id || id;
        if (clientId) {
          await updateClient({ id: clientId, data: clientData });
          toast.success("Cliente atualizado com sucesso!");
        }
      } else {
        await createClient(clientData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      
      if (isInDialogMode && onClose) {
        onClose();
      } else {
        navigate("/dashboard/clients");
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar cliente. Tente novamente."
          : "Erro ao cadastrar cliente. Tente novamente."
      );
    }
  };

  // In dialog mode, we don't show the card header and footer
  if (isInDialogMode) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="12345-678" 
                        value={field.value || ""}
                        onChange={(e) => {
                          handleCEPFormat(e);
                          field.onChange(e);
                        }} 
                      />
                      {isFetchingAddress && (
                        <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Digite o CEP para preencher o endereço automaticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço completo" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anotações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações adicionais sobre o cliente..." 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Observações importantes sobre o cliente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating || isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Full page mode (não está no diálogo)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="12345-678" 
                          value={field.value || ""}
                          onChange={(e) => {
                            handleCEPFormat(e);
                            field.onChange(e);
                          }} 
                        />
                        {isFetchingAddress && (
                          <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Digite o CEP para preencher o endereço automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Observações importantes sobre o cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-4 flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard/clients")}
                disabled={isCreating || isUpdating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Atualizar" : "Cadastrar"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
