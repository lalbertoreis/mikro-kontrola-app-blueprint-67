import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, ServicePackage } from "@/types/service";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { BusinessSettings } from "@/types/settings";
import { mockSettings } from "@/data/mockSettings";

export function usePublicBooking(slug: string | undefined, navigate: NavigateFunction) {
  const { services, isLoading: isServicesLoading } = useServices();
  const { packages, isLoading: isPackagesLoading } = useServicePackages();
  const { employees, isLoading: isEmployeesLoading } = useEmployees();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isMyAppointmentsDialogOpen, setIsMyAppointmentsDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string } | null>(null);
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
  const [tempBookingData, setTempBookingData] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessSettings | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);

  // Fetch business settings based on slug
  useEffect(() => {
    const fetchBusinessBySlug = async () => {
      try {
        setIsLoadingBusiness(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .eq('enable_online_booking', true)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setBusinessProfile({
            businessName: data.business_name || '',
            businessLogo: data.business_logo || '',
            enableOnlineBooking: data.enable_online_booking || false,
            slug: data.slug || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
            address: data.address || '',
            bookingSimultaneousLimit: data.booking_simultaneous_limit || 3,
            bookingFutureLimit: data.booking_future_limit || 3,
            bookingTimeInterval: data.booking_time_interval || 30,
            bookingCancelMinHours: data.booking_cancel_min_hours || 1,
            createdAt: data.created_at || '',
            updatedAt: data.updated_at || ''
          });
        } else {
          // No business found with this slug
          navigate('/booking/404');
        }
      } catch (error) {
        console.error("Error fetching business:", error);
        navigate('/booking/404');
      } finally {
        setIsLoadingBusiness(false);
      }
    };

    if (slug) {
      fetchBusinessBySlug();
    }
  }, [slug, navigate]);

  // Check if the business exists
  const businessExists = businessProfile && businessProfile.enableOnlineBooking;

  // Filter active services
  const activeServices = services.filter((service) => service.isActive);
  const activePackages = packages.filter((pkg) => pkg.showInOnlineBooking && pkg.isActive);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsBookingDialogOpen(true);
  };

  const handlePackageClick = (pkg: ServicePackage) => {
    // For demo purposes, just show a toast
    toast.info("Funcionalidade de agendamento de pacotes em breve!");
  };

  const handleBookingConfirm = (bookingData: any) => {
    console.log("Booking data:", bookingData);
    
    // The flow has changed - now we always receive client info directly in bookingData
    if (bookingData.clientInfo) {
      // Use the client info provided in the booking form
      const userData = {
        name: bookingData.clientInfo.name,
        phone: bookingData.clientInfo.phone
      };
      
      // Store user info and process booking directly
      localStorage.setItem("bookingUser", JSON.stringify(userData));
      setUserProfile(userData);
      setIsLoggedIn(true);
      processBooking(bookingData);
    } else {
      // This case shouldn't happen anymore with the new flow but keeping as fallback
      toast.error("Informações de cliente não fornecidas");
    }
  };

  const handleLogin = (userData: { name: string; phone: string }) => {
    // Store user info in local storage (in a real app, you'd use proper auth)
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    setUserProfile(userData);
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("bookingUser");
    setUserProfile(null);
    setIsLoggedIn(false);
    setAppointments([]);
  };

  const processBooking = (bookingData: any) => {
    const { service, employee, date, time } = bookingData;
    
    // In a real app, you would save this to your database
    const newAppointment: BookingAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      serviceName: service.name,
      employeeName: employee.name,
      date,
      time,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    toast.success("Agendamento realizado com sucesso!");
  };

  const handleCancelAppointment = (id: string) => {
    // In a real app, you would call your API to cancel the appointment
    setAppointments((prev) => prev.filter((app) => app.id !== id));
    toast.success("Agendamento cancelado com sucesso!");
  };

  // Check if user is already logged in from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bookingUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
        setIsLoggedIn(true);
        
        // In a real app, you would fetch the user's appointments here
        // For now, we'll leave the appointments empty
      } catch (e) {
        localStorage.removeItem("bookingUser");
      }
    }
  }, []);

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
    tempBookingData,
    setTempBookingData,
    handleServiceClick,
    handlePackageClick,
    handleBookingConfirm,
    handleLogin,
    handleLogout,
    handleCancelAppointment
  };
}
