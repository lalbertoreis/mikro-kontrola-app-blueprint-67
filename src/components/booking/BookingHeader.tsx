
import React from "react";
import { BusinessSettings } from "@/types/settings";
import { Instagram, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingHeaderProps {
  settings: BusinessSettings;
  onMyAppointmentsClick?: () => void;
  onLogoutClick?: () => void;
  isLoggedIn?: boolean;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({
  settings,
  onMyAppointmentsClick,
  onLogoutClick,
  isLoggedIn = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 bg-white">
      {/* Logo */}
      <div className="rounded-full bg-blue-500 p-2 w-20 h-20 flex items-center justify-center mb-2">
        {settings.businessLogo ? (
          <img 
            src={settings.businessLogo} 
            alt={settings.businessName} 
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <img
            src="/placeholder.svg"
            alt={settings.businessName}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
      </div>

      {/* Business Name */}
      <h1 className="text-2xl font-bold">{settings.businessName} ✨</h1>

      {/* Contact Links */}
      <div className="flex space-x-4">
        {settings.whatsapp && (
          <a 
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white rounded-full p-3"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
        
        {settings.instagram && (
          <a 
            href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white rounded-full p-3"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}
        
        {settings.address && (
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white rounded-full p-3"
          >
            <MapPin className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex w-full max-w-xs justify-between mt-4">
        {isLoggedIn && (
          <>
            <Button 
              variant="outline"
              onClick={onMyAppointmentsClick}
              className="flex-1 mr-2"
            >
              Meus agendamentos
            </Button>
            <Button 
              variant="destructive"
              onClick={onLogoutClick}
            >
              Sair
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHeader;
