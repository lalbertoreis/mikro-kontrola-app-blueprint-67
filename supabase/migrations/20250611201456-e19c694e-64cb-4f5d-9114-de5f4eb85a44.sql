
-- Ativar RLS em todas as tabelas críticas e criar políticas de segurança

-- 1. Tabela appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own appointments" ON public.appointments;
CREATE POLICY "Users can insert own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" 
  ON public.appointments FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own appointments" ON public.appointments;
CREATE POLICY "Users can delete own appointments" 
  ON public.appointments FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" 
  ON public.clients FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" 
  ON public.clients FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" 
  ON public.clients FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" 
  ON public.clients FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Tabela services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own services" ON public.services;
CREATE POLICY "Users can view own services" 
  ON public.services FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own services" ON public.services;
CREATE POLICY "Users can insert own services" 
  ON public.services FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own services" ON public.services;
CREATE POLICY "Users can update own services" 
  ON public.services FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own services" ON public.services;
CREATE POLICY "Users can delete own services" 
  ON public.services FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Tabela employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own employees" ON public.employees;
CREATE POLICY "Users can view own employees" 
  ON public.employees FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own employees" ON public.employees;
CREATE POLICY "Users can insert own employees" 
  ON public.employees FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own employees" ON public.employees;
CREATE POLICY "Users can update own employees" 
  ON public.employees FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own employees" ON public.employees;
CREATE POLICY "Users can delete own employees" 
  ON public.employees FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Tabela transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Outras tabelas relacionadas
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shifts" ON public.shifts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own employee_services" ON public.employee_services FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own fixed_costs" ON public.fixed_costs FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payment_methods" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own service_packages" ON public.service_packages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own holidays" ON public.holidays FOR ALL USING (auth.uid() = user_id);
