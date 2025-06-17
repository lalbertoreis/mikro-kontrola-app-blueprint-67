
-- Função para buscar próximos agendamentos do usuário
CREATE OR REPLACE FUNCTION public.get_upcoming_appointments(user_id_param uuid, limit_param integer DEFAULT 5)
RETURNS TABLE(
  id uuid,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  client_name text,
  client_phone text,
  service_name text,
  service_price numeric,
  employee_name text,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    a.id,
    a.start_time,
    a.end_time,
    c.name as client_name,
    c.phone as client_phone,
    s.name as service_name,
    s.price as service_price,
    e.name as employee_name,
    a.status
  FROM public.appointments a
  JOIN public.clients c ON a.client_id = c.id
  JOIN public.services s ON a.service_id = s.id
  JOIN public.employees e ON a.employee_id = e.id
  WHERE a.user_id = user_id_param
    AND a.start_time > NOW()
    AND a.status IN ('scheduled', 'confirmed')
  ORDER BY a.start_time ASC
  LIMIT limit_param;
$$;

-- Função para buscar serviços mais usados
CREATE OR REPLACE FUNCTION public.get_most_used_services(user_id_param uuid, days_param integer DEFAULT 30)
RETURNS TABLE(
  service_id uuid,
  service_name text,
  usage_count bigint,
  total_revenue numeric,
  avg_price numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    s.id as service_id,
    s.name as service_name,
    COUNT(a.id) as usage_count,
    SUM(s.price) as total_revenue,
    AVG(s.price) as avg_price
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  WHERE a.user_id = user_id_param
    AND a.start_time >= NOW() - (days_param || ' days')::interval
    AND a.status = 'completed'
  GROUP BY s.id, s.name
  ORDER BY usage_count DESC;
$$;

-- Função para calcular custo médio dos serviços (corrigida)
CREATE OR REPLACE FUNCTION public.get_average_service_cost(user_id_param uuid, days_param integer DEFAULT 30)
RETURNS TABLE(
  total_appointments bigint,
  total_revenue numeric,
  average_cost numeric,
  period_start date,
  period_end date
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COUNT(a.id) as total_appointments,
    COALESCE(SUM(s.price), 0) as total_revenue,
    CASE 
      WHEN COUNT(a.id) > 0 THEN COALESCE(AVG(s.price), 0)
      ELSE 0
    END as average_cost,
    (NOW() - (days_param || ' days')::interval)::date as period_start,
    NOW()::date as period_end
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  WHERE a.user_id = user_id_param
    AND a.start_time::date >= (NOW() - (days_param || ' days')::interval)::date
    AND a.start_time::date <= NOW()::date
    AND a.status = 'completed';
$$;

-- Função para calcular taxa de ocupação detalhada
CREATE OR REPLACE FUNCTION public.get_occupation_rate(user_id_param uuid, days_param integer DEFAULT 30)
RETURNS TABLE(
  date_period date,
  total_slots integer,
  booked_slots integer,
  occupation_rate numeric,
  revenue numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH date_series AS (
    SELECT generate_series(
      (NOW() - (days_param || ' days')::interval)::date,
      NOW()::date,
      '1 day'::interval
    )::date as date_period
  ),
  daily_appointments AS (
    SELECT 
      a.start_time::date as appointment_date,
      COUNT(a.id) as booked_slots,
      SUM(s.price) as revenue
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.user_id = user_id_param
      AND a.start_time::date >= (NOW() - (days_param || ' days')::interval)::date
      AND a.status IN ('completed', 'confirmed', 'scheduled')
    GROUP BY a.start_time::date
  )
  SELECT 
    ds.date_period,
    24 as total_slots,
    COALESCE(da.booked_slots, 0)::integer as booked_slots,
    CASE 
      WHEN 24 > 0 THEN (COALESCE(da.booked_slots, 0)::numeric / 24 * 100)
      ELSE 0
    END as occupation_rate,
    COALESCE(da.revenue, 0) as revenue
  FROM date_series ds
  LEFT JOIN daily_appointments da ON ds.date_period = da.appointment_date
  ORDER BY ds.date_period;
$$;

-- Função para buscar tendências de crescimento
CREATE OR REPLACE FUNCTION public.get_growth_trends(user_id_param uuid, days_param integer DEFAULT 90)
RETURNS TABLE(
  date_period date,
  new_clients bigint,
  total_appointments bigint,
  completed_appointments bigint,
  revenue numeric,
  cumulative_clients bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH date_series AS (
    SELECT generate_series(
      (NOW() - (days_param || ' days')::interval)::date,
      NOW()::date,
      '1 day'::interval
    )::date as date_period
  ),
  daily_clients AS (
    SELECT 
      c.created_at::date as client_date,
      COUNT(c.id) as new_clients
    FROM public.clients c
    WHERE c.user_id = user_id_param
      AND c.created_at::date >= (NOW() - (days_param || ' days')::interval)::date
    GROUP BY c.created_at::date
  ),
  daily_appointments AS (
    SELECT 
      a.start_time::date as appointment_date,
      COUNT(a.id) as total_appointments,
      COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
      SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as revenue
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.user_id = user_id_param
      AND a.start_time::date >= (NOW() - (days_param || ' days')::interval)::date
    GROUP BY a.start_time::date
  )
  SELECT 
    ds.date_period,
    COALESCE(dc.new_clients, 0) as new_clients,
    COALESCE(da.total_appointments, 0) as total_appointments,
    COALESCE(da.completed_appointments, 0) as completed_appointments,
    COALESCE(da.revenue, 0) as revenue,
    SUM(COALESCE(dc.new_clients, 0)) OVER (ORDER BY ds.date_period) as cumulative_clients
  FROM date_series ds
  LEFT JOIN daily_clients dc ON ds.date_period = dc.client_date
  LEFT JOIN daily_appointments da ON ds.date_period = da.appointment_date
  ORDER BY ds.date_period;
$$;
