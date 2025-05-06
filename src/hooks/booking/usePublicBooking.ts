
import { useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { Service } from "@/types/service";
import { useBusinessProfile } from "./useBusinessProfile";
import { useServicesWithEmployees } from "./useServicesWithEmployees";
import { usePackages } from "./usePackages";
import { usePublicBookingFlow } from "./usePublicBookingFlow";
import { useBookingAuth } from "./useBookingAuth";
import { useBookingHandlers } from "./useBookingHandlers";

/**
 * Main hook for public booking functionality, now composed of smaller hooks
 */
export function usePublicBooking(slug: string | undefined, navigate: NavigateFunction) {
  // Fetch business profile first to get the business user ID
  const { 
    businessProfile, 
    isLoadingBusiness, 
    businessExists, 
    businessUserId 
  } = useBusinessProfile(slug, navigate);
  
  console.log("In usePublicBooking, businessUserId:", businessUserId);
  
  // Get services with employee availability info
  const {
    services: activeServices,
    isServicesLoading,
    isEmployeesLoading,
    isViewLoading,
    employees,
    bookingSettings
  } = useServicesWithEmployees(slug);
  
  // Get active packages
  const { activePackages, isPackagesLoading } = usePackages();
  
  // Manage booking flow state
  const {
    selectedService,
    setSelectedService,
    isBookingDialogOpen,
    setIsBookingDialogOpen,
    isLoginDialogOpen,
    setIsLoginDialogOpen,
    isMyAppointmentsDialogOpen,
    setIsMyAppointmentsDialogOpen,
    bookingConfirmed,
    setBookingConfirmed,
    confirmationDate,
    setConfirmationDate,
    confirmationTime,
    setConfirmationTime
  } = usePublicBookingFlow();
  
  // Get user authentication state
  const { 
    isLoggedIn, 
    userProfile, 
    appointments, 
    setAppointments, 
    handleLogin, 
    handleLogout 
  } = useBookingAuth();
  
  // Get booking handlers
  const {
    handleServiceClick: baseHandleServiceClick,
    handlePackageClick,
    handleBookingConfirm,
    handleCancelAppointment
  } = useBookingHandlers(
    slug, 
    businessUserId, 
    setIsBookingDialogOpen, 
    setBookingConfirmed,
    setConfirmationDate,
    setConfirmationTime
  );

  // Customize service click handler to also set the selected service
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    baseHandleServiceClick(service);
  };

  // Log active services for debugging
  useEffect(() => {
    console.log(`usePublicBooking hook: ${activeServices.length} active services available`);
    activeServices.forEach(service => console.log(`- ${service.name} (hasEmployees: ${service.hasEmployees})`));
  }, [activeServices]);

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
    isViewLoading,
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
    confirmationTime,
    bookingSettings
  };
}
