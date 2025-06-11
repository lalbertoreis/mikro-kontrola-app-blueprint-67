
-- Adicionar coluna theme_preference à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN theme_preference TEXT DEFAULT 'light';

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.profiles.theme_preference IS 'User preference for theme: light, dark, or system';
