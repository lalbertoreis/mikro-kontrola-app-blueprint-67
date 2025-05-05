import { useState, useEffect, useMemo } from "react";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, ServicePackage } from "@/types/service";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { BusinessSettings } from "@/types/settings";
import { format, parseISO } from "date-fns";

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
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Map services to employees
  const serviceWithEmployeesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    employees.forEach(employee => {
      (employee.services || []).forEach(serviceId => {
        if (!map.has(serviceId)) {
          map.set(serviceId, []);
        }
        map.get(serviceId)?.push(employee.id);
      });
    });
    
    return map;
  }, [employees]);

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
          .maybeSingle();
        
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

  // Filter active services that have associated employees
  const activeServices = useMemo(() => {
    return services.filter((service) => 
      service.isActive && 
      serviceWithEmployeesMap.has(service.id) && 
      serviceWithEmployeesMap.get(service.id)?.length > 0
    );
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

  // Fix the processBooking function to handle date correctly
  const processBooking = async (bookingData: any) => {
    const { service, employee, date, time, clientInfo } = bookingData;
    
    try {
      // Check if client exists or create new client
      let clientId;
      const { data: existingClient, error: clientFetchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', clientInfo.phone)
        .maybeSingle();
      
      if (clientFetchError) throw clientFetchError;
      
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            name: clientInfo.name,
            phone: clientInfo.phone,
            user_id: (await supabase.auth.getUser()).data.user?.id || null
          })
          .select('id')
          .single();
        
        if (createClientError) throw createClientError;
        clientId = newClient.id;
      }
      
      // Fix: Create date object and set time WITHOUT timezone adjustments
      const dateStr = format(date, 'yyyy-MM-dd');
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create start and end date objects with the correct date and time
      const startDate = new Date(`${dateStr}T${time}:00`);
      // Ensure we're using local time by setting hours/minutes directly
      startDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on service duration
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);
      
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          employee_id: employee.id,
          service_id: service.id,
          client_id: clientId,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: 'scheduled',
          user_id: (await supabase.auth.getUser()).data.user?.id || null
        })
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;
      
      // Add to local appointments list
      const newAppointment: BookingAppointment = {
        id: appointment.id,
        serviceName: service.name,
        employeeName: employee.name,
        date: format(date, 'dd/MM/yyyy'),
        time,
        status: 'scheduled'
      };
      
      setAppointments((prev) => [...prev, newAppointment]);
      
      // Play sound notification (if exists)
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        console.log('Sound notification not available');
      });
      
      return appointment;
    } catch (error) {
      console.error('Error processing booking:', error);
      throw error;
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

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id);
      
      if (error) throw error;
      
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error("Erro ao cancelar agendamento");
    }
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

  // Fix the fetchUserAppointments function to handle dates correctly
  useEffect(() => {
    const fetchUserAppointments = async () => {
      if (!isLoggedIn || !userProfile?.phone) return;
      
      try {
        // First get the client id by phone
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', userProfile.phone)
          .maybeSingle();
        
        if (clientError || !client) return;
        
        // Then fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id, 
            start_time,
            status,
            employees(name),
            services(name)
          `)
          .eq('client_id', client.id)
          .neq('status', 'canceled')
          .order('start_time', { ascending: true });
        
        if (appointmentsError) throw appointmentsError;
        
        // Transform data for UI with proper date handling
        const bookingAppointments: BookingAppointment[] = appointmentsData.map(app => ({
          id: app.id,
          serviceName: app.services?.name || 'Serviço',
          employeeName: app.employees?.name || 'Profissional',
          date: format(parseISO(app.start_time), 'dd/MM/yyyy'),
          time: format(parseISO(app.start_time), 'HH:mm'),
          status: app.status
        }));
        
        setAppointments(bookingAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    
    fetchUserAppointments();
  }, [isLoggedIn, userProfile]);

  // Fix handleBookingConfirm to manage modal state correctly
  const handleBookingConfirm = async (bookingData: any) => {
    console.log("Booking data:", bookingData);
    
    // The flow has changed - now we always receive client info directly in bookingData
    if (bookingData.clientInfo) {
      // Use the client info provided in the booking form
      const userData = {
        name: bookingData.clientInfo.name,
        phone: bookingData.clientInfo.phone
      };
      
      // Store user info
      localStorage.setItem("bookingUser", JSON.stringify(userData));
      setUserProfile(userData);
      setIsLoggedIn(true);
      
      try {
        // Only show confirmation screen after successful DB operation
        const result = await processBooking(bookingData);
        if (result) {
          // Successfully processed booking
          setIsBookingDialogOpen(false);
          setBookingConfirmed(true); // This state will control the confirmation modal
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
    handleCancelAppointment,
    bookingConfirmed: bookingConfirmed, // Add this to expose the confirmation state
    setBookingConfirmed: setBookingConfirmed, // Add this to allow resetting the state
  };
}
