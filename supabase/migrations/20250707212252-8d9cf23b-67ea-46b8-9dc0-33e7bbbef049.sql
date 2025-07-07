-- Adicionar função para validar slug único
CREATE OR REPLACE FUNCTION public.validate_unique_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe outro perfil com o mesmo slug (exceto o próprio registro em updates)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE slug = NEW.slug 
    AND slug IS NOT NULL 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Este identificador já está em uso. Escolha outro nome para sua agenda online.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação de slug único
DROP TRIGGER IF EXISTS validate_slug_unique_trigger ON public.profiles;
CREATE TRIGGER validate_slug_unique_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_unique_slug();