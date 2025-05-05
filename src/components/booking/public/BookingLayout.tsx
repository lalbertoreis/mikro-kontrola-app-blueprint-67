
import React from "react";
import BookingHeader from "@/components/booking/BookingHeader";
import { BusinessSettings } from "@/types/settings";

interface BookingLayoutProps {
  children: React.ReactNode;
  businessProfile: BusinessSettings | null;
  isLoggedIn: boolean;
  onMyAppointmentsClick: () => void;
  onLogoutClick: () => void;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  businessProfile,
  isLoggedIn,
  onMyAppointmentsClick,
  onLogoutClick
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader 
        settings={businessProfile}
        onMyAppointmentsClick={onMyAppointmentsClick}
        onLogoutClick={onLogoutClick}
        isLoggedIn={isLoggedIn}
      />
      
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

export default BookingLayout;
