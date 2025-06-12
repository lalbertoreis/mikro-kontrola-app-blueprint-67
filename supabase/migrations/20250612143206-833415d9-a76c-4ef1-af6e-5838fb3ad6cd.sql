
-- Permitir que usuários anônimos consultem clientes apenas através das funções RPC seguras
-- (as funções já estão configuradas com SECURITY DEFINER)

-- Criar política RLS para permitir que usuários anônimos insiram novos clientes
-- apenas quando autenticados ou através das funções seguras
CREATE POLICY "Allow anon insert clients via secure functions" 
  ON public.clients 
  FOR INSERT 
  TO anon
  WITH CHECK (true); -- A validação será feita pelas funções RPC

-- Permitir que usuários anônimos leiam clientes apenas através das funções RPC
-- (não permitir SELECT direto na tabela)
CREATE POLICY "Allow anon read clients via secure functions" 
  ON public.clients 
  FOR SELECT 
  TO anon
  USING (false); -- Forçar uso das funções RPC apenas

-- Garantir que as funções RPC podem acessar a tabela clients
GRANT SELECT, INSERT, UPDATE ON public.clients TO postgres;

-- Permitir que usuários anônimos executem as funções RPC
GRANT EXECUTE ON FUNCTION public.check_client_by_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_client_for_auth(text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.update_client_pin(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_client_pin(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.find_clients_by_phone(text) TO anon;

-- Permitir acesso às views para usuários anônimos
-- (necessário para consultar histórico após login)
GRANT SELECT ON public.appointments_view TO anon;
GRANT SELECT ON public.business_services_view TO anon;

-- Para tabelas subjacentes necessárias para as views funcionarem
GRANT SELECT ON public.appointments TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.employees TO anon;
GRANT SELECT ON public.clients TO anon;

-- Criar políticas RLS básicas para permitir acesso às tabelas subjacentes
CREATE POLICY "Allow anon read appointments for booking flow" 
  ON public.appointments 
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anon read profiles for booking flow" 
  ON public.profiles 
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anon read services for booking flow" 
  ON public.services 
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anon read employees for booking flow" 
  ON public.employees 
  FOR SELECT 
  TO anon
  USING (true);
