
-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS public.create_client_for_auth(text, text, text, uuid);

-- Agora criar a função com o novo retorno que inclui error_message
CREATE OR REPLACE FUNCTION public.create_client_for_auth(
  name_param text,
  phone_param text,
  pin_param text DEFAULT NULL,
  business_user_id_param uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  success boolean,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_client_id uuid;
  hashed_pin text;
  existing_client_count int;
BEGIN
  -- Log da entrada para debugging
  RAISE LOG 'create_client_for_auth called with: name=%, phone=%, has_pin=%, business_user_id=%', 
    name_param, phone_param, (pin_param IS NOT NULL), business_user_id_param;
  
  -- Validação do formato do telefone (deve ter exatamente 11 dígitos)
  IF phone_param IS NULL OR phone_param !~ '^\d{11}$' THEN
    RAISE LOG 'Invalid phone format: %', phone_param;
    RETURN QUERY SELECT NULL::uuid, false, 'Formato de telefone inválido. Deve conter exatamente 11 dígitos.'::text;
    RETURN;
  END IF;
  
  -- Validação do nome (deve ter pelo menos 2 caracteres)
  IF name_param IS NULL OR length(trim(name_param)) < 2 THEN
    RAISE LOG 'Invalid name: %', name_param;
    RETURN QUERY SELECT NULL::uuid, false, 'Nome deve ter pelo menos 2 caracteres.'::text;
    RETURN;
  END IF;
  
  -- Validação do PIN se fornecido
  IF pin_param IS NOT NULL AND (length(pin_param) != 4 OR pin_param !~ '^\d{4}$') THEN
    RAISE LOG 'Invalid PIN format: %', pin_param;
    RETURN QUERY SELECT NULL::uuid, false, 'PIN deve ter exatamente 4 dígitos numéricos.'::text;
    RETURN;
  END IF;
  
  -- Verificar se já existe um cliente com este telefone
  SELECT COUNT(*) INTO existing_client_count 
  FROM public.clients 
  WHERE phone = phone_param;
  
  IF existing_client_count > 0 THEN
    RAISE LOG 'Client already exists with phone: %', phone_param;
    RETURN QUERY SELECT NULL::uuid, false, 'Já existe um cliente cadastrado com este número de telefone.'::text;
    RETURN;
  END IF;
  
  -- Hash do PIN se fornecido
  IF pin_param IS NOT NULL THEN
    hashed_pin := crypt(pin_param, gen_salt('bf'));
    RAISE LOG 'PIN hashed successfully';
  END IF;
  
  -- Tentar inserir o cliente
  BEGIN
    INSERT INTO public.clients (name, phone, pin, user_id)
    VALUES (trim(name_param), phone_param, hashed_pin, business_user_id_param)
    RETURNING id INTO new_client_id;
    
    RAISE LOG 'Client created successfully with ID: %', new_client_id;
    RETURN QUERY SELECT new_client_id, true, 'Cliente criado com sucesso.'::text;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE LOG 'Unique violation error when creating client';
      RETURN QUERY SELECT NULL::uuid, false, 'Este número de telefone já está cadastrado.'::text;
    WHEN OTHERS THEN
      RAISE LOG 'Unexpected error when creating client: % %', SQLSTATE, SQLERRM;
      RETURN QUERY SELECT NULL::uuid, false, format('Erro inesperado: %s', SQLERRM)::text;
  END;
END;
$$;

-- Conceder permissões para a nova função
GRANT EXECUTE ON FUNCTION public.create_client_for_auth(text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_client_for_auth(text, text, text, uuid) TO authenticated;

-- Verificar se a tabela clients tem as políticas RLS adequadas
-- Política para permitir INSERT de clientes por usuários anônimos
DROP POLICY IF EXISTS "Allow anonymous client creation" ON public.clients;
CREATE POLICY "Allow anonymous client creation" 
ON public.clients 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política para permitir SELECT de clientes por usuários anônimos (necessário para verificações)
DROP POLICY IF EXISTS "Allow anonymous client read" ON public.clients;
CREATE POLICY "Allow anonymous client read" 
ON public.clients 
FOR SELECT 
TO anon 
USING (true);
