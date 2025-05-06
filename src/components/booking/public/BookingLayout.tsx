
import React, { ReactNode } from "react";
import { BusinessSettings } from "@/types/settings";
import { UserCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingLayoutProps {
  children: ReactNode;
  businessProfile: BusinessSettings | null;
  isLoggedIn: boolean;
  userProfile?: { name: string; phone: string } | null;
  onMyAppointmentsClick: () => void;
  onLogoutClick: () => void;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  businessProfile,
  isLoggedIn,
  userProfile,
  onMyAppointmentsClick,
  onLogoutClick
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              {businessProfile?.businessLogo ? (
                <img
                  className="h-8 w-auto"
                  src={businessProfile.businessLogo}
                  alt={businessProfile.businessName || "Business logo"}
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">
                  {businessProfile?.businessName || "Agendamento Online"}
                </h1>
              )}
            </div>
            
            {isLoggedIn && userProfile ? (
              <div className="flex items-center">
                <div className="relative inline-block text-left">
                  <div>
                    <button 
                      type="button"
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none"
                      id="menu-button"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={onMyAppointmentsClick}
                    >
                      <UserCircle2 className="mr-2 h-5 w-5" />
                      {userProfile.name.split(' ')[0]}
                    </button>
                  </div>
                  
                  <button
                    onClick={onLogoutClick}
                    className="ml-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Business Info Banner */}
      {businessProfile && (
        <div className="bg-purple-600 text-white">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {businessProfile.businessName || "Agendamento Online"}
              </h2>
              
              {businessProfile.address && (
                <p className="mt-1">{businessProfile.address}</p>
              )}
              
              <div className="mt-2 flex justify-center space-x-4">
                {businessProfile.whatsapp && (
                  <a 
                    href={`https://wa.me/${businessProfile.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200"
                  >
                    WhatsApp
                  </a>
                )}
                
                {businessProfile.instagram && (
                  <a 
                    href={`https://instagram.com/${businessProfile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Floating Button for Appointments (only when not logged in) */}
      {!isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={onMyAppointmentsClick}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            size="lg"
            aria-label="Acessar meus agendamentos"
          >
            <Calendar className="w-6 h-6" />
          </Button>
        </div>
      )}

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
