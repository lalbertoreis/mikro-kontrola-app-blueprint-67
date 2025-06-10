
-- Criar tabela para armazenar o progresso do onboarding
CREATE TABLE public.onboarding_status (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_skipped BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Habilitar RLS para segurança
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seu próprio progresso
CREATE POLICY "Users can view their own onboarding status" 
  ON public.onboarding_status 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários possam inserir seu próprio progresso
CREATE POLICY "Users can insert their own onboarding status" 
  ON public.onboarding_status 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que usuários possam atualizar seu próprio progresso
CREATE POLICY "Users can update their own onboarding status" 
  ON public.onboarding_status 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_onboarding_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_onboarding_status_updated_at
  BEFORE UPDATE ON public.onboarding_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_status_updated_at();
