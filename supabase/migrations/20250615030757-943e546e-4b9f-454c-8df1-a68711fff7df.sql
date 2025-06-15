
-- Verificar se a política para funcionários visualizarem agendamentos existe e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointments' 
        AND policyname = 'Employees can view business appointments'
    ) THEN
        CREATE POLICY "Employees can view business appointments" 
          ON public.appointments 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 
              FROM public.employee_permissions ep
              WHERE ep.user_id = auth.uid() 
                AND ep.business_owner_id = appointments.user_id
                AND ep.can_view_calendar = true
            )
          );
    END IF;
END
$$;

-- Verificar se a política para funcionários atualizarem seus agendamentos existe e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointments' 
        AND policyname = 'Employees can update their own appointments'
    ) THEN
        CREATE POLICY "Employees can update their own appointments" 
          ON public.appointments 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 
              FROM public.employee_permissions ep
              WHERE ep.user_id = auth.uid() 
                AND ep.business_owner_id = appointments.user_id
                AND ep.can_edit_own_appointments = true
                AND ep.employee_id = appointments.employee_id
            )
          );
    END IF;
END
$$;
