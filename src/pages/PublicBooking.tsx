
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
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

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

  return (
    <BookingLayout
      businessProfile={businessProfile}
      isLoggedIn={isLoggedIn}
      onMyAppointmentsClick={() => setIsMyAppointmentsDialogOpen(true)}
      onLogoutClick={handleLogout}
    >
      {/* Botão flutuante para acessar os agendamentos */}
      {!isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={() => setIsLoginDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            size="lg"
          >
            <CalendarCheck className="w-6 h-6" />
          </Button>
        </div>
      )}
      
      <ServicesList 
        services={activeServices} 
        onServiceClick={handleServiceClick}
        isLoading={isLoading}
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
        onBookingConfirm={handleBookingConfirm}
        onLogin={handleLogin}
        onCancelAppointment={handleCancelAppointment}
        bookingSettings={bookingSettings}
        businessSlug={slug}
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
