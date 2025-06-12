
-- Primeiro, vamos habilitar a extensão pgcrypto para hash de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para verificar se cliente existe por telefone (SEM retornar PIN)
CREATE OR REPLACE FUNCTION public.check_client_by_phone(phone_param text)
RETURNS TABLE(
  id uuid,
  name text,
  phone text,
  user_id uuid,
  has_pin boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    c.id, 
    c.name, 
    c.phone, 
    c.user_id,
    (c.pin IS NOT NULL AND c.pin != '') as has_pin
  FROM public.clients c
  WHERE c.phone = phone_param 
    AND phone_param ~ '^\d{11}$' -- Validação formato telefone BR
  LIMIT 1;
$$;

-- Função para criar cliente (com validações)
CREATE OR REPLACE FUNCTION public.create_client_for_auth(
  name_param text,
  phone_param text,
  pin_param text DEFAULT NULL,
  business_user_id_param uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_client_id uuid;
  hashed_pin text;
BEGIN
  -- Validações de entrada
  IF phone_param !~ '^\d{11}$' THEN
    RETURN QUERY SELECT NULL::uuid, false;
    RETURN;
  END IF;
  
  IF length(trim(name_param)) < 2 THEN
    RETURN QUERY SELECT NULL::uuid, false;
    RETURN;
  END IF;
  
  -- Hash do PIN se fornecido
  IF pin_param IS NOT NULL AND length(pin_param) = 4 THEN
    hashed_pin := crypt(pin_param, gen_salt('bf'));
  END IF;
  
  -- Inserir cliente
  INSERT INTO public.clients (name, phone, pin, user_id)
  VALUES (trim(name_param), phone_param, hashed_pin, business_user_id_param)
  RETURNING id INTO new_client_id;
  
  RETURN QUERY SELECT new_client_id, true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::uuid, false;
END;
$$;

-- Função para atualizar PIN do cliente (com validações de segurança)
CREATE OR REPLACE FUNCTION public.update_client_pin(
  phone_param text,
  pin_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validações
  IF phone_param !~ '^\d{11}$' OR length(pin_param) != 4 THEN
    RETURN false;
  END IF;
  
  -- Atualizar apenas se o telefone existe
  UPDATE public.clients 
  SET pin = crypt(pin_param, gen_salt('bf')), 
      updated_at = now()
  WHERE phone = phone_param;
  
  RETURN FOUND;
END;
$$;

-- Função para verificar PIN do cliente (com hash)
CREATE OR REPLACE FUNCTION public.verify_client_pin(
  phone_param text,
  pin_param text
)
RETURNS TABLE(
  id uuid,
  name text,
  phone text,
  user_id uuid,
  pin_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Validações de entrada
  IF phone_param !~ '^\d{11}$' OR length(pin_param) != 4 THEN
    RETURN;
  END IF;
  
  SELECT c.id, c.name, c.phone, c.pin, c.user_id
  INTO client_record
  FROM public.clients c
  WHERE c.phone = phone_param AND c.pin IS NOT NULL
  LIMIT 1;
  
  IF client_record.id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    client_record.id,
    client_record.name,
    client_record.phone,
    client_record.user_id,
    (client_record.pin = crypt(pin_param, client_record.pin)) as pin_valid;
END;
$$;

-- Função para buscar clientes por telefone em múltiplos negócios
CREATE OR REPLACE FUNCTION public.find_clients_by_phone(phone_param text)
RETURNS TABLE(
  id uuid,
  name text,
  phone text,
  user_id uuid,
  has_pin boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    c.id, 
    c.name, 
    c.phone, 
    c.user_id,
    (c.pin IS NOT NULL AND c.pin != '') as has_pin
  FROM public.clients c
  WHERE c.phone = phone_param 
    AND phone_param ~ '^\d{11}$'
  ORDER BY c.created_at DESC;
$$;

-- Conceder permissões para usuários anônimos
GRANT EXECUTE ON FUNCTION public.check_client_by_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_client_for_auth(text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.update_client_pin(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_client_pin(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.find_clients_by_phone(text) TO anon;

-- Revogar permissões diretas na tabela para anon (garantir que só use as funções)
REVOKE ALL ON public.clients FROM anon;
