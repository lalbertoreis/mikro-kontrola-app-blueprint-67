-- Adicionar campo package_id na tabela appointments para suportar agendamentos de pacotes
ALTER TABLE public.appointments 
ADD COLUMN package_id UUID REFERENCES public.service_packages(id);

-- Permitir que service_id seja nullable quando package_id estiver preenchido
ALTER TABLE public.appointments 
ALTER COLUMN service_id DROP NOT NULL;

-- Adicionar constraint para garantir que pelo menos um dos dois campos esteja preenchido
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_service_or_package_check 
CHECK (
  (service_id IS NOT NULL AND package_id IS NULL) OR 
  (service_id IS NULL AND package_id IS NOT NULL)
);