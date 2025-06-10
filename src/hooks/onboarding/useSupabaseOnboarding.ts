
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingState } from '@/types/onboardingTypes';

export const useSupabaseOnboarding = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Buscar o progresso do usuário no Supabase
  const fetchOnboardingStatus = async (): Promise<OnboardingState | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar status do onboarding:', error);
        return null;
      }

      if (data) {
        console.log('Status do onboarding encontrado no Supabase:', data);
        return {
          currentStep: data.current_step,
          isCompleted: data.is_completed,
          isSkipped: data.is_skipped,
          isWizardVisible: !data.is_completed && !data.is_skipped
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar onboarding status:', error);
      return null;
    }
  };

  // Salvar ou atualizar o progresso no Supabase
  const saveOnboardingStatus = async (state: OnboardingState) => {
    if (!user) return;

    try {
      console.log('Salvando status do onboarding no Supabase:', state);
      
      const { error } = await supabase
        .from('onboarding_status')
        .upsert({
          user_id: user.id,
          current_step: state.currentStep,
          is_completed: state.isCompleted,
          is_skipped: state.isSkipped,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar status do onboarding:', error);
      } else {
        console.log('Status do onboarding salvo com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar onboarding status:', error);
    }
  };

  return {
    fetchOnboardingStatus,
    saveOnboardingStatus,
    isLoading,
    setIsLoading
  };
};
