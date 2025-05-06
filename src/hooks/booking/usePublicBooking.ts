
import { useState, useMemo, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { useServicesBySlug } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, ServicePackage } from "@/types/service";
import { useBusinessProfile } from "./useBusinessProfile";
import { useBookingAuth } from "./useBookingAuth";
import { processBooking, cancelAppointment, fetchUserAppointmentsByPhone } from "./utils";

export function usePublicBooking(slug: string | undefined, navigate: NavigateFunction) {
  // Fetch business profile first to get the business user ID
  const { 
    businessProfile, 
    isLoadingBusiness, 
    businessExists, 
    businessUserId 
  } = useBusinessProfile(slug, navigate);
  
  console.log("In usePublicBooking, businessUserId:", businessUserId);
  
  // Usar o novo hook que busca serviços diretamente pelo slug
  const { data: services = [], isLoading: isServicesLoading } = useServicesBySlug(slug);
  const { packages, isLoading: isPackagesLoading } = useServicePackages();
  const { employees, isLoading: isEmployeesLoading } = useEmployees();
  
  const { 
    isLoggedIn, 
    userProfile, 
    appointments, 
    setAppointments, 
    handleLogin, 
    handleLogout 
  } = useBookingAuth();

  // Local state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isMyAppointmentsDialogOpen, setIsMyAppointmentsDialogOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [confirmationDate, setConfirmationDate] = useState<Date | null>(null);
  const [confirmationTime, setConfirmationTime] = useState<string | null>(null);

  // Map services to employees
  const serviceWithEmployeesMap = useMemo(() => {
    console.log("Building serviceWithEmployeesMap with employees:", employees.length);
    const map = new Map<string, string[]>();
    
    employees.forEach(employee => {
      if (!employee.services) {
        console.log(`Employee ${employee.name} has no services defined`);
        return;
      }
      
      employee.services.forEach(serviceId => {
        console.log(`Employee ${employee.name} has service ${serviceId}`);
        if (!map.has(serviceId)) {
          map.set(serviceId, []);
        }
        map.get(serviceId)?.push(employee.id);
      });
    });
    
    // Debug what's in the map
    console.log("ServiceWithEmployeesMap final size:", map.size);
    map.forEach((employeeIds, serviceId) => {
      console.log(`Service ${serviceId} has ${employeeIds.length} employees`);
    });
    
    return map;
  }, [employees]);

  console.log("Services available:", services.length);
  console.log("ServiceWithEmployeesMap size:", Array.from(serviceWithEmployeesMap.keys()).length);

  // Add hasEmployees property to services
  const servicesWithEmployeeFlag = useMemo(() => {
    return services.map(service => {
      const hasEmployees = serviceWithEmployeesMap.has(service.id) && 
                         (serviceWithEmployeesMap.get(service.id)?.length || 0) > 0;
      
      console.log(`Service ${service.name} (${service.id}): hasEmployees=${hasEmployees}`);
      
      return {
        ...service,
        hasEmployees
      };
    });
  }, [services, serviceWithEmployeesMap]);

  // Filter active services (já são filtrados pela view, não precisamos filtrar novamente)
  const activeServices = servicesWithEmployeeFlag;

  // Filter active packages
  const activePackages = packages.filter((pkg) => pkg.showInOnlineBooking && pkg.isActive);

  const handleServiceClick = (service: Service) => {
    if (service.hasEmployees === false) {
      toast.info("Este serviço não tem profissionais disponíveis no momento.");
      return;
    }
    
    setSelectedService(service);
    setIsBookingDialogOpen(true);
  };

  const handlePackageClick = (pkg: ServicePackage) => {
    // For demo purposes, just show a toast
    toast.info("Funcionalidade de agendamento de pacotes em breve!");
  };

  const handleBookingConfirm = async (bookingData: any) => {
    console.log("Booking data:", bookingData);
    
    // Store date and time for confirmation screen
    setConfirmationDate(bookingData.date);
    setConfirmationTime(bookingData.time);
    
    // The flow has changed - now we always receive client info directly in bookingData
    if (bookingData.clientInfo) {
      // Use the client info provided in the booking form
      const userData = {
        name: bookingData.clientInfo.name,
        phone: bookingData.clientInfo.phone
      };
      
      // Store user info and set logged in
      handleLogin(userData);
      
      try {
        // Process the booking in the database
        const result = await processBooking({
          ...bookingData,
          businessSlug: slug, // Passar o slug para identificar o negócio correto
          businessUserId: businessUserId // Passar o ID do usuário do negócio
        });
        
        if (result) {
          // Add to local appointments list
          setAppointments((prev) => [...prev, result.newAppointment]);
          
          // Close booking dialog and show confirmation
          setIsBookingDialogOpen(false);
          setBookingConfirmed(true);
        }
      } catch (error) {
        console.error("Error processing booking:", error);
        toast.error("Erro ao realizar agendamento. Tente novamente.");
      }
    } else {
      // This case shouldn't happen anymore with the new flow but keeping as fallback
      toast.error("Informações de cliente não fornecidas");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment(id, slug);
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  return {
    businessProfile,
    isLoadingBusiness,
    businessExists,
    activeServices,
    activePackages,
    isServicesLoading,
    isPackagesLoading,
    employees,
    isEmployeesLoading,
    selectedService,
    setSelectedService,
    isBookingDialogOpen,
    setIsBookingDialogOpen,
    isLoginDialogOpen,
    setIsLoginDialogOpen,
    isMyAppointmentsDialogOpen,
    setIsMyAppointmentsDialogOpen,
    isLoggedIn,
    userProfile,
    appointments,
    handleServiceClick,
    handlePackageClick,
    handleBookingConfirm,
    handleLogin,
    handleLogout,
    handleCancelAppointment,
    bookingConfirmed,
    setBookingConfirmed,
    confirmationDate,
    confirmationTime
  };
}
