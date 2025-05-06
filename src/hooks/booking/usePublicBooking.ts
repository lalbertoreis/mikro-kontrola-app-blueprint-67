import { useState, useMemo } from "react";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, ServicePackage } from "@/types/service";
import { useBusinessProfile } from "./useBusinessProfile";
import { useBookingAuth } from "./useBookingAuth";
import { processBooking, cancelAppointment, fetchUserAppointmentsByPhone } from "./utils/bookingUtils";

export function usePublicBooking(slug: string | undefined, navigate: NavigateFunction) {
  // Fetch business profile first to get businessUserId
  const { 
    businessProfile, 
    isLoadingBusiness, 
    businessExists, 
    businessUserId 
  } = useBusinessProfile(slug, navigate);
  
  console.log("usePublicBooking - businessUserId:", businessUserId);
  
  // Fetch data using custom hooks, passing businessUserId to filter data
  const { services, isLoading: isServicesLoading } = useServices(businessUserId);
  const { packages, isLoading: isPackagesLoading } = useServicePackages();
  const { employees, isLoading: isEmployeesLoading } = useEmployees();
  
  console.log("usePublicBooking - services count:", services.length);
  console.log("usePublicBooking - services:", services);
  console.log("usePublicBooking - employees count:", employees.length);
  
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
    const map = new Map<string, string[]>();
    
    console.log("Building serviceWithEmployeesMap with", employees.length, "employees");
    
    employees.forEach(employee => {
      console.log("Employee:", employee.name, "services:", employee.services);
      (employee.services || []).forEach(serviceId => {
        if (!map.has(serviceId)) {
          map.set(serviceId, []);
        }
        map.get(serviceId)?.push(employee.id);
      });
    });
    
    console.log("serviceWithEmployeesMap size:", map.size);
    return map;
  }, [employees]);

  // Filter active services that have associated employees
  const activeServices = useMemo(() => {
    console.log("Filtering active services from", services.length, "services");
    console.log("Raw services:", services);
    
    const filtered = services.filter((service) => {
      const isActive = service.isActive;
      const hasEmployeeMap = serviceWithEmployeesMap.has(service.id);
      const hasEmployees = hasEmployeeMap && (serviceWithEmployeesMap.get(service.id)?.length || 0) > 0;
      
      console.log(`Service ${service.name} (${service.id}): isActive=${isActive}, hasEmployeeMap=${hasEmployeeMap}, hasEmployees=${hasEmployees}`);
      
      return isActive && hasEmployeeMap && hasEmployees;
    });
    
    console.log("Filtered active services:", filtered.length);
    return filtered;
  }, [services, serviceWithEmployeesMap]);

  // Filter active packages
  const activePackages = packages.filter((pkg) => pkg.showInOnlineBooking && pkg.isActive);

  const handleServiceClick = (service: Service) => {
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
