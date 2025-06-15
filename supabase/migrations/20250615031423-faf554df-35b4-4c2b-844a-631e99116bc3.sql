
-- Permitir que funcionários vejam serviços do negócio onde trabalham
CREATE POLICY "Employees can view business services" 
  ON public.services 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.employee_permissions ep
      WHERE ep.user_id = auth.uid() 
        AND ep.business_owner_id = services.user_id
        AND ep.can_view_calendar = true
    )
  );

-- Permitir que funcionários vejam funcionários do negócio onde trabalham
CREATE POLICY "Employees can view business employees" 
  ON public.employees 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.employee_permissions ep
      WHERE ep.user_id = auth.uid() 
        AND ep.business_owner_id = employees.user_id
        AND ep.can_view_calendar = true
    )
  );

-- Permitir que funcionários vejam clientes do negócio onde trabalham
CREATE POLICY "Employees can view business clients" 
  ON public.clients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.employee_permissions ep
      WHERE ep.user_id = auth.uid() 
        AND ep.business_owner_id = clients.user_id
        AND ep.can_view_calendar = true
    )
  );
