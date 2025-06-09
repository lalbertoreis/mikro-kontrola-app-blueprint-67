
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingCheck = (stepId: string) => {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !stepId) {
      setIsLoading(false);
      return;
    }

    const checkStepCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('step_id', stepId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar progresso:', error);
          return;
        }

        setIsCompleted(data?.completed || false);
      } catch (error) {
        console.error('Erro ao verificar progresso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStepCompletion();
  }, [user, stepId]);

  return { isCompleted, isLoading };
};
