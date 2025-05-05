
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useEmployees } from "@/hooks/useEmployees";
import { Separator } from "@/components/ui/separator";
import BookingHeader from "@/components/booking/BookingHeader";
import ServiceCard from "@/components/booking/ServiceCard";
import BookingDialog from "@/components/booking/BookingDialog";
import LoginDialog from "@/components/booking/LoginDialog";
import MyAppointmentsDialog from "@/components/booking/MyAppointmentsDialog";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { Service, ServicePackage } from "@/types/service";
import { Business404 } from "@/pages/Business404";
import { mockSettings } from "@/data/mockSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSettings } from "@/types/settings";

const PublicBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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
    // If user is not logged in, prompt for login first
    if (!isLoggedIn) {
      setTempBookingData(bookingData);
      setIsLoginDialogOpen(true);
      return;
    }

    // Otherwise, process the booking directly
    processBooking(bookingData);
  };

  const handleLogin = (userData: { name: string; phone: string }) => {
    // Store user info in local storage (in a real app, you'd use proper auth)
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    setUserProfile(userData);
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);

    // If there was a pending booking, process it
    if (tempBookingData) {
      processBooking(tempBookingData);
      setTempBookingData(null);
    }
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
    
    // Close the booking dialog (the confirmation is shown inside the dialog)
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

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Carregando informações do negócio...</p>
      </div>
    );
  }

  if (!businessExists) {
    return <Business404 />;
  }

  const isLoading = isServicesLoading || isPackagesLoading || isEmployeesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader 
        settings={businessProfile || mockSettings}
        onMyAppointmentsClick={() => setIsMyAppointmentsDialogOpen(true)}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
      />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            {activeServices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Serviços</h2>
                {activeServices.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    item={service} 
                    onClick={() => handleServiceClick(service)} 
                  />
                ))}
              </div>
            )}

            {activePackages.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Pacotes</h2>
                {activePackages.map((pkg) => (
                  <ServiceCard 
                    key={pkg.id} 
                    item={pkg} 
                    isPackage={true} 
                    onClick={() => handlePackageClick(pkg)} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedService && (
        <BookingDialog
          open={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          service={selectedService}
          employees={employees}
          onBookingConfirm={handleBookingConfirm}
        />
      )}

      <LoginDialog
        open={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLogin={handleLogin}
      />

      <MyAppointmentsDialog
        open={isMyAppointmentsDialogOpen}
        onClose={() => setIsMyAppointmentsDialogOpen(false)}
        appointments={appointments}
        onCancelAppointment={handleCancelAppointment}
      />
    </div>
  );
};

export default PublicBooking;
