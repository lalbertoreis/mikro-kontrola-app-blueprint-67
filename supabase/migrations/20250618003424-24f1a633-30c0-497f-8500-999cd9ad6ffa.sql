
-- Criar tabela para persistir notificações no banco de dados
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  entity_id UUID,
  entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

-- Inserir algumas notificações de exemplo para usuários existentes
INSERT INTO public.notifications (user_id, title, message, type, read, created_at) 
SELECT 
  p.id as user_id,
  'Bem-vindo ao Kontrola!' as title,
  'Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.' as message,
  'system' as type,
  false as read,
  now() - interval '1 day' as created_at
FROM public.profiles p
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (user_id, title, message, type, read, created_at) 
SELECT 
  p.id as user_id,
  'Novo agendamento' as title,
  'Você tem um novo agendamento para hoje às 15:00' as message,
  'appointment_created' as type,
  false as read,
  now() - interval '2 hours' as created_at
FROM public.profiles p
ON CONFLICT DO NOTHING;
