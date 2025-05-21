
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ServicePackage, ServicePackageFormData } from "@/types/service";
import { useServices } from "@/hooks/useServices";
import ServiceSearchPanel from "./ServiceSearchPanel";
import SelectedServicesList from "./SelectedServicesList";
import PackageInfoForm from "./PackageInfoForm";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "O preço não pode ser negativo.",
  }),
  discount: z.coerce.number().min(0).max(100, {
    message: "O desconto deve estar entre 0 e 100%.",
  }),
  showInOnlineBooking: z.boolean().default(true),
});

interface ServicePackageFormProps {
  servicePackage?: ServicePackage | null;
  onFormChange?: () => void;
  onClose?: () => void;
}

const ServicePackageForm = ({
  servicePackage,
  onFormChange,
  onClose
}: ServicePackageFormProps) => {
  const { toast } = useToast();
  const { services } = useServices();
  const isEditing = Boolean(servicePackage?.id);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    servicePackage?.services || []
  );
  const [editMode, setEditMode] = useState<"discount" | "price">("discount");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: servicePackage
      ? {
          name: servicePackage.name,
          description: servicePackage.description || "",
          price: servicePackage.price,
          discount: servicePackage.discount,
          showInOnlineBooking: servicePackage.showInOnlineBooking,
        }
      : {
          name: "",
          description: "",
          price: 0,
          discount: 0,
          showInOnlineBooking: true,
        },
  });

  // Set up form change watcher
  useEffect(() => {
    if (onFormChange) {
      const subscription = form.watch(() => onFormChange());
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange]);

  // Notify parent when selected services change
  useEffect(() => {
    if (onFormChange) {
      onFormChange();
    }
  }, [selectedServices, onFormChange]);

  // Calculate total price of selected services
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Monitor price and discount field changes
  const watchDiscount = form.watch("discount");
  const watchPrice = form.watch("price");

  // Update price or discount based on edit mode
  useEffect(() => {
    if (selectedServices.length === 0) return;
    
    if (editMode === "discount") {
      // Calculate final price from discount
      const discountAmount = (totalPrice * watchDiscount) / 100;
      const finalPrice = totalPrice - discountAmount;
      form.setValue("price", Number(finalPrice.toFixed(2)));
    } else {
      // Calculate discount from final price
      const discountPercent = ((totalPrice - watchPrice) / totalPrice) * 100;
      form.setValue("discount", Number(discountPercent.toFixed(2)));
    }
  }, [watchDiscount, watchPrice, totalPrice, editMode, selectedServices.length, form]);

  const toggleService = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedServices.length < 2) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos 2 serviços para criar um pacote.",
        variant: "destructive",
      });
      return;
    }

    // Prepare package data
    const packageData: ServicePackageFormData = {
      name: values.name,
      description: values.description || "",
      services: selectedServices,
      price: values.price,
      discount: values.discount,
      showInOnlineBooking: values.showInOnlineBooking,
    };

    console.log("Form submitted:", packageData);

    // Simulate success
    setTimeout(() => {
      toast({
        title: isEditing ? "Pacote atualizado!" : "Pacote cadastrado!",
        description: `${values.name} foi ${
          isEditing ? "atualizado" : "cadastrado"
        } com sucesso.`,
      });
      if (onClose) onClose();
    }, 1000);
  };

  // Toggle between discount and price edit modes
  const toggleEditMode = () => {
    setEditMode(editMode === "discount" ? "price" : "discount");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <ServiceSearchPanel 
                services={services}
                selectedServices={selectedServices}
                onServiceToggle={toggleService}
              />
              
              <SelectedServicesList 
                selectedServices={selectedServices}
                services={services}
                totalPrice={totalPrice}
                discountedPrice={form.watch("price")}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Informações do Pacote</h3>
            <Form {...form}>
              <PackageInfoForm 
                form={form}
                editMode={editMode}
                toggleEditMode={toggleEditMode}
                totalPrice={totalPrice}
                onSubmit={onSubmit}
                isEditing={isEditing}
                onClose={onClose}
              />
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePackageForm;
