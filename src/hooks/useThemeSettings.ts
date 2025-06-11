
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useThemeSettings = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Carregar tema do usuário do banco de dados
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single();

        if (error) {
          console.log('Erro ao carregar tema:', error);
          return;
        }

        if (data?.theme_preference && data.theme_preference !== theme) {
          setTheme(data.theme_preference);
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      }
    };

    loadUserTheme();
  }, [user, setTheme]);

  // Salvar tema no banco de dados
  const saveTheme = async (newTheme: string) => {
    if (!user) {
      setTheme(newTheme);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao salvar tema:', error);
        toast.error('Erro ao salvar preferência de tema');
        return;
      }

      setTheme(newTheme);
      toast.success(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast.error('Erro ao salvar preferência de tema');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    saveTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    isLoading
  };
};
