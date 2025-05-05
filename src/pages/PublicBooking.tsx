
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Business404 } from "@/pages/Business404";
import { usePublicBooking } from "@/hooks/booking/usePublicBooking";
import BookingLayout from "@/components/booking/public/BookingLayout";
import ServicesList from "@/components/booking/public/ServicesList";
import PackagesList from "@/components/booking/public/PackagesList";
import BookingDialogs from "@/components/booking/public/BookingDialogs";

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
    handleCancelAppointment
  } = usePublicBooking(slug, navigate);

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
        onBookingConfirm={handleBookingConfirm}
        onLogin={() => {}}
        onCancelAppointment={handleCancelAppointment}
      />
    </BookingLayout>
  );
};

export default PublicBooking;
