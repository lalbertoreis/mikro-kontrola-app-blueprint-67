
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Business404 from "@/pages/Business404";
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
    console.log(`PublicBooking component: ${activePackages.length} active packages available`);
    console.log("PublicBooking loading states:", {
      isServicesLoading,
      isPackagesLoading,
      isEmployeesLoading,
      isViewLoading
    });
    
    activeServices.forEach(service => console.log(`- Service: ${service.name} (hasEmployees: ${service.hasEmployees})`));
    activePackages.forEach(pkg => console.log(`- Package: ${pkg.name}`));
  }, [activeServices, activePackages, isServicesLoading, isPackagesLoading, isEmployeesLoading, isViewLoading]);

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

  // Show loading state while data is being fetched
  const isLoading = isServicesLoading || isPackagesLoading || isEmployeesLoading || isViewLoading;

  console.log("PublicBooking render state:", {
    isLoading,
    servicesCount: activeServices.length,
    packagesCount: activePackages.length,
    employeesCount: employees.length
  });

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
      {isLoading ? (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando serviços disponíveis...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <ServicesList 
          services={activeServices} 
          employees={employees}
          onSelectService={handleServiceClick}
          themeColor={businessProfile?.bookingColor}
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
