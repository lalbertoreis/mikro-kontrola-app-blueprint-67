
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Business404 } from "@/pages/Business404";
import { usePublicBooking } from "@/hooks/booking/usePublicBooking";
import BookingLayout from "@/components/booking/public/BookingLayout";
import ServicesList from "@/components/booking/public/ServicesList";
import PackagesList from "@/components/booking/public/PackagesList";
import BookingDialogs from "@/components/booking/public/BookingDialogs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ConfirmationScreen from "@/components/booking/dialog/ConfirmationScreen";

const PublicBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const {
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
    isLoadingAppointments,
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
  } = usePublicBooking(slug, navigate);

  // Log active services when they change
  useEffect(() => {
    console.log(`PublicBooking component: ${activeServices.length} active services available`);
    activeServices.forEach(service => console.log(`- ${service.name} (hasEmployees: ${service.hasEmployees})`));
  }, [activeServices]);

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

  // Considerar todas as fontes de loading para um estado mais preciso
  const isLoading = isServicesLoading || isPackagesLoading || isEmployeesLoading || isViewLoading;

  // Convert the complex booking confirm handler to match the expected signature
  const handleBookingConfirmWrapper = (employeeId: string, date: Date, time: string) => {
    // Find the employee object
    const employee = employees.find(emp => emp.id === employeeId);
    
    // Find the service object
    const service = selectedService;
    
    if (employee && service) {
      handleBookingConfirm({ 
        service, 
        employee, 
        date, 
        time,
        clientInfo: { name: "Test Client", phone: "123456789" }  // This would come from the form in a real scenario
      });
    }
  };

  // Adapting the booking settings to match required structure
  const adaptedBookingSettings = {
    minDaysInAdvance: bookingSettings.simultaneousLimit || 0,
    maxDaysInFuture: bookingSettings.futureLimit || 30,
    simultaneousLimit: bookingSettings.simultaneousLimit || 3,
    timeInterval: 30, // Default interval
    cancelHoursLimit: bookingSettings.cancelMinHours || 24
  };

  return (
    <BookingLayout
      businessProfile={businessProfile}
      isLoggedIn={isLoggedIn}
      userProfile={userProfile}
      onMyAppointmentsClick={() => setIsMyAppointmentsDialogOpen(true)}
      onLoginClick={() => setIsLoginDialogOpen(true)} 
      onLogoutClick={handleLogout}
    >      
      <ServicesList 
        services={activeServices} 
        onServiceClick={handleServiceClick}
        isLoading={isLoading}
        bookingColor={businessProfile?.bookingColor}
      />

      {!isLoading && activePackages.length > 0 && (
        <PackagesList 
          packages={activePackages} 
          onPackageClick={handlePackageClick} 
        />
      )}

      {!isLoading && activeServices.length === 0 && activePackages.length === 0 && (
        <div className="py-10 text-center">
          <h3 className="text-lg font-medium text-gray-900">Nenhum serviço disponível</h3>
          <p className="mt-2 text-sm text-gray-500">
            Este negócio ainda não tem serviços disponíveis para agendamento online.
          </p>
        </div>
      )}

      <BookingDialogs
        selectedService={selectedService}
        isBookingDialogOpen={isBookingDialogOpen}
        isLoginDialogOpen={isLoginDialogOpen}
        isMyAppointmentsDialogOpen={isMyAppointmentsDialogOpen}
        employees={employees}
        businessProfile={businessProfile}
        appointments={appointments}
        onCloseBookingDialog={() => setIsBookingDialogOpen(false)}
        onCloseLoginDialog={() => setIsLoginDialogOpen(false)}
        onCloseAppointmentsDialog={() => setIsMyAppointmentsDialogOpen(false)}
        onBookingConfirm={handleBookingConfirmWrapper}
        onLogin={handleLogin}
        onCancelAppointment={handleCancelAppointment}
        bookingSettings={adaptedBookingSettings}
        businessSlug={slug}
        isLoadingAppointments={isLoadingAppointments}
      />
      
      {/* Separate confirmation dialog */}
      <Dialog 
        open={bookingConfirmed} 
        onOpenChange={(open) => !open && setBookingConfirmed(false)}
      >
        <DialogContent className="sm:max-w-md p-0">
          <ConfirmationScreen
            selectedDate={confirmationDate}
            selectedTime={confirmationTime}
            onClose={() => setBookingConfirmed(false)}
          />
        </DialogContent>
      </Dialog>
    </BookingLayout>
  );
};

export default PublicBooking;
