
-- Política para permitir que usuários vejam apenas seus próprios feriados
CREATE POLICY "Users can view their own holidays" 
  ON public.holidays 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios feriados
CREATE POLICY "Users can insert their own holidays" 
  ON public.holidays 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios feriados
CREATE POLICY "Users can update their own holidays" 
  ON public.holidays 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam seus próprios feriados
CREATE POLICY "Users can delete their own holidays" 
  ON public.holidays 
  FOR DELETE 
  USING (auth.uid() = user_id);
