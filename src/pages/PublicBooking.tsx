
import React, { useState } from "react";
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
  const [confirmationDate, setConfirmationDate] = useState<Date | null>(null);
  const [confirmationTime, setConfirmationTime] = useState<string | null>(null);
  
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
    handleLogout,
    handleCancelAppointment,
    bookingConfirmed,
    setBookingConfirmed
  } = usePublicBooking(slug, navigate);

  // Modified booking confirmation handler to capture date/time for confirmation screen
  const handleBookingConfirmWithDetails = async (bookingData: any) => {
    // Store the date and time for the confirmation screen
    setConfirmationDate(bookingData.date);
    setConfirmationTime(bookingData.time);
    
    // Call the original handler
    await handleBookingConfirm(bookingData);
  };

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
    <BookingLayout
      businessProfile={businessProfile}
      isLoggedIn={isLoggedIn}
      onMyAppointmentsClick={() => setIsMyAppointmentsDialogOpen(true)}
      onLogoutClick={handleLogout}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p>Carregando...</p>
        </div>
      ) : (
        <>
          {activeServices.length > 0 && (
            <ServicesList 
              services={activeServices} 
              onServiceClick={handleServiceClick} 
            />
          )}

          {activePackages.length > 0 && (
            <PackagesList 
              packages={activePackages} 
              onPackageClick={handlePackageClick} 
            />
          )}
        </>
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
        onBookingConfirm={handleBookingConfirmWithDetails}
        onLogin={() => {}}
        onCancelAppointment={handleCancelAppointment}
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
