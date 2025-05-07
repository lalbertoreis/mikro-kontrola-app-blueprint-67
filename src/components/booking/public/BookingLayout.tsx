
import React, { ReactNode } from "react";
import { BusinessSettings } from "@/types/settings";
import { UserCircle2, Calendar, Phone, Instagram, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingLayoutProps {
  children: ReactNode;
  businessProfile: BusinessSettings | null;
  isLoggedIn: boolean;
  userProfile?: { name: string; phone: string } | null;
  onMyAppointmentsClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  businessProfile,
  isLoggedIn,
  userProfile,
  onMyAppointmentsClick,
  onLoginClick,
  onLogoutClick
}) => {
  // Use the business profile color or default to purple
  const bookingColor = businessProfile?.bookingColor || "#9b87f5";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Simplified to match the image */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 px-4 space-y-3 bg-white">
        {/* Logo */}
        <div 
          className="rounded-full p-2 w-20 h-20 flex items-center justify-center mb-2" 
          style={{ backgroundColor: bookingColor }}
        >
          {businessProfile?.businessLogo ? (
            <img 
              src={businessProfile.businessLogo} 
              alt={businessProfile.businessName || ""} 
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bookingColor }}
            >
              <span className="text-white text-xl font-bold">
                {businessProfile?.businessName?.substring(0, 1) || "A"}
              </span>
            </div>
          )}
        </div>

        {/* Business Name */}
        <h1 className="text-2xl font-bold">{businessProfile?.businessName} ✨</h1>
        
        {/* Contact Links */}
        <div className="flex space-x-4 mb-4">
          {businessProfile?.whatsapp && (
            <a 
              href={`https://wa.me/${businessProfile.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white rounded-full p-3"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          
          {businessProfile?.instagram && (
            <a 
              href={`https://instagram.com/${businessProfile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white rounded-full p-3"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          
          {businessProfile?.address && (
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(businessProfile.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white rounded-full p-3"
            >
              <MapPin className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Floating Buttons - Updated based on login status */}
      <div className="fixed bottom-6 right-6 z-10 flex flex-col space-y-4">
        {isLoggedIn ? (
          <>
            {/* My Appointments button when logged in */}
            <Button
              onClick={onMyAppointmentsClick}
              className="text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: bookingColor }}
              size="lg"
              aria-label="Acessar meus agendamentos"
            >
              <Calendar className="w-6 h-6" />
            </Button>
            
            {/* Logout button when logged in */}
            <Button
              onClick={onLogoutClick}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
              size="lg"
              aria-label="Fazer logout"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </>
        ) : (
          /* Login button when not logged in - Now uses bookingColor */
          <Button
            onClick={onLoginClick}
            className="text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: bookingColor }}
            size="lg"
            aria-label="Fazer login"
          >
            <UserCircle2 className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {businessProfile?.businessName || "Agendamento Online"}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BookingLayout;
