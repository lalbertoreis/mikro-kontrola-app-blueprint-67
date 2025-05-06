
import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessSettings } from "@/types/settings";

export function useBusinessProfile(slug: string | undefined, navigate: NavigateFunction) {
  const [businessProfile, setBusinessProfile] = useState<BusinessSettings | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [businessUserId, setBusinessUserId] = useState<string | null>(null);

  // Fetch business settings based on slug
  useEffect(() => {
    const fetchBusinessBySlug = async () => {
      try {
        setIsLoadingBusiness(true);
        
        // Primeiro: define o slug atual para a sessão (importante para as políticas RLS)
        if (slug) {
          // Definir o slug para a sessão usando a função que criamos no banco de dados
          await supabase.rpc('set_slug_for_session', { slug });
          console.log("Set session slug:", slug);
        }
        
        // Agora podemos buscar o perfil do negócio com o slug definido
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .eq('enable_online_booking', true)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching business profile:", error);
          navigate('/booking/404');
          return;
        }
        
        if (data) {
          console.log("Business profile found:", data);
          setBusinessUserId(data.id); // Armazenar o ID do usuário do negócio
          
          setBusinessProfile({
            businessName: data.business_name || '',
            businessLogo: data.business_logo || '',
            enableOnlineBooking: data.enable_online_booking || false,
            slug: data.slug || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
            address: data.address || '',
            bookingSimultaneousLimit: data.booking_simultaneous_limit || 3,
            bookingFutureLimit: data.booking_future_limit || 3,
            bookingTimeInterval: data.booking_time_interval || 30,
            bookingCancelMinHours: data.booking_cancel_min_hours || 1,
            createdAt: data.created_at || '',
            updatedAt: data.updated_at || ''
          });
        } else {
          // No business found with this slug
          console.error("No business found with slug:", slug);
          navigate('/booking/404');
        }
      } catch (error) {
        console.error("Error in business profile hook:", error);
        navigate('/booking/404');
      } finally {
        setIsLoadingBusiness(false);
      }
    };

    if (slug) {
      fetchBusinessBySlug();
    }
  }, [slug, navigate]);

  // Check if the business exists and allows online booking
  const businessExists = businessProfile && businessProfile.enableOnlineBooking;

  return {
    businessProfile,
    isLoadingBusiness,
    businessExists,
    businessUserId  // Adicionar businessUserId ao retorno
  };
}
