
-- Permitir que funcionários vejam feriados do negócio onde trabalham
CREATE POLICY "Employees can view business holidays" 
  ON public.holidays 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.employee_permissions ep
      WHERE ep.user_id = auth.uid() 
        AND ep.business_owner_id = holidays.user_id
        AND ep.can_view_calendar = true
    )
  );
