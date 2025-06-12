
import { useState, useEffect } from "react";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { fetchUserAppointmentsByPhone } from "./utils/appointmentManagement";
import { toast } from "sonner";

export function useBookingAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string } | null>(null);
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  
  // Check if user is already logged in from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bookingUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem("bookingUser");
      }
    }
  }, []);

  // Fetch user appointments when logged in
  useEffect(() => {
    const loadUserAppointments = async () => {
      if (!isLoggedIn || !userProfile?.phone) return;
      
      try {
        setIsLoadingAppointments(true);
        console.log("Loading appointments for user:", userProfile.phone);
        
        // Buscar agendamentos em TODOS os negócios para este telefone
        const bookingAppointments = await fetchUserAppointmentsByPhone(userProfile.phone);
        
        console.log("Loaded appointments:", bookingAppointments);
        setAppointments(bookingAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Erro ao carregar seus agendamentos');
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    
    loadUserAppointments();
  }, [isLoggedIn, userProfile]);

  const handleLogin = (userData: { name: string; phone: string }) => {
    console.log("User logged in:", userData);
    // Store user info in local storage
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    setUserProfile(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("bookingUser");
    setUserProfile(null);
    setIsLoggedIn(false);
    setAppointments([]);
  };

  return {
    isLoggedIn,
    userProfile,
    appointments,
    setAppointments,
    isLoadingAppointments,
    handleLogin,
    handleLogout
  };
}
