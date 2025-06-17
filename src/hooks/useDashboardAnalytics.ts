
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UpcomingAppointment {
  id: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  service_price: number;
  employee_name: string;
  status: string;
}

export interface MostUsedService {
  service_id: string;
  service_name: string;
  usage_count: number;
  total_revenue: number;
  avg_price: number;
}

export interface AverageServiceCost {
  total_appointments: number;
  total_revenue: number;
  average_cost: number;
  period_start: string;
  period_end: string;
}

export interface OccupationRate {
  date_period: string;
  total_slots: number;
  booked_slots: number;
  occupation_rate: number;
  revenue: number;
}

export interface GrowthTrend {
  date_period: string;
  new_clients: number;
  total_appointments: number;
  completed_appointments: number;
  revenue: number;
  cumulative_clients: number;
}

export function useUpcomingAppointments(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcoming-appointments", user?.id, limit],
    queryFn: async (): Promise<UpcomingAppointment[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('get_upcoming_appointments', { 
          user_id_param: user.id, 
          limit_param: limit 
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMostUsedServices(days = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["most-used-services", user?.id, days],
    queryFn: async (): Promise<MostUsedService[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('get_most_used_services', { 
          user_id_param: user.id, 
          days_param: days 
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAverageServiceCost(days = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["average-service-cost", user?.id, days],
    queryFn: async (): Promise<AverageServiceCost> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('get_average_service_cost', { 
          user_id_param: user.id, 
          days_param: days 
        });

      if (error) throw error;
      return data?.[0] || {
        total_appointments: 0,
        total_revenue: 0,
        average_cost: 0,
        period_start: '',
        period_end: ''
      };
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useOccupationRate(days = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["occupation-rate", user?.id, days],
    queryFn: async (): Promise<OccupationRate[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('get_occupation_rate', { 
          user_id_param: user.id, 
          days_param: days 
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useGrowthTrends(days = 90) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["growth-trends", user?.id, days],
    queryFn: async (): Promise<GrowthTrend[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('get_growth_trends', { 
          user_id_param: user.id, 
          days_param: days 
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
