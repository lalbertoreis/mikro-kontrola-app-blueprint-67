
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { OnboardingProgress, OnboardingSettings } from '@/types/onboarding';

interface UseOnboardingActionsProps {
  progress: OnboardingProgress[];
  setProgress: (progress: OnboardingProgress[] | ((prev: OnboardingProgress[]) => OnboardingProgress[])) => void;
  settings: OnboardingSettings;
  setSettings: (settings: OnboardingSettings) => void;
  setWasRecentlyReset: (value: boolean) => void;
}

export const useOnboardingActions = ({
  progress,
  setProgress,
  settings,
  setSettings,
  setWasRecentlyReset
}: UseOnboardingActionsProps) => {
  const { user } = useAuth();

  // Marcar passo como completo
  const markStepCompleted = async (stepId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_id'
        });

      if (error) {
        console.error('Error marking step completed:', error);
        toast.error('Erro ao salvar progresso');
        return;
      }

      // Atualizar estado local
      setProgress(prev => {
        const existing = prev.find(p => p.step_id === stepId);
        if (existing) {
          return prev.map(p => 
            p.step_id === stepId 
              ? { ...p, completed: true, completed_at: new Date().toISOString() }
              : p
          );
        } else {
          return [...prev, {
            step_id: stepId,
            completed: true,
            completed_at: new Date().toISOString()
          }];
        }
      });

      console.log(`Step ${stepId} marked as completed`);
    } catch (error) {
      console.error('Error in markStepCompleted:', error);
      toast.error('Erro ao salvar progresso');
    }
  };

  // Atualizar configurações
  const updateSettings = async (newSettings: Partial<OnboardingSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('user_onboarding_settings')
        .upsert({
          user_id: user.id,
          dont_show_again: updatedSettings.dont_show_again,
          current_step_index: updatedSettings.current_step_index,
          is_completed: updatedSettings.is_completed
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating onboarding settings:', error);
        toast.error('Erro ao salvar configurações');
        return;
      }

      setSettings(updatedSettings);
      console.log('Settings updated:', updatedSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  // Resetar onboarding - MARCAR como false ao invés de deletar
  const resetOnboarding = async () => {
    if (!user) return;

    try {
      console.log('Resetting onboarding - marking all steps as incomplete');
      
      // Marcar que acabou de ser resetado para prevenir auto-detecção
      setWasRecentlyReset(true);
      
      // Primeiro, obter todos os passos existentes
      const { data: existingProgress } = await supabase
        .from('onboarding_progress')
        .select('step_id')
        .eq('user_id', user.id);

      // Marcar todos os passos como false ao invés de deletar
      if (existingProgress && existingProgress.length > 0) {
        const updates = existingProgress.map(p => ({
          user_id: user.id,
          step_id: p.step_id,
          completed: false,
          completed_at: null
        }));

        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert(updates, {
            onConflict: 'user_id,step_id'
          });

        if (progressError) {
          console.error('Error resetting progress:', progressError);
          toast.error('Erro ao resetar progresso');
          return;
        }
      }

      // Resetar configurações no banco
      const { error: settingsError } = await supabase
        .from('user_onboarding_settings')
        .upsert({
          user_id: user.id,
          dont_show_again: false,
          current_step_index: 0,
          is_completed: false
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) {
        console.error('Error resetting settings:', settingsError);
        toast.error('Erro ao resetar configurações');
        return;
      }

      // Atualizar estado local IMEDIATAMENTE
      const resetProgress = existingProgress?.map(p => ({
        step_id: p.step_id,
        completed: false,
        completed_at: null
      })) || [];

      setProgress(resetProgress);
      setSettings({
        dont_show_again: false,
        current_step_index: 0,
        is_completed: false
      });
      
      console.log('Onboarding reset completed - all progress marked as false');
      toast.success('Tutorial reiniciado');
      
      // Remover a flag de reset após 10 segundos para permitir futuras detecções apenas em novos carregamentos
      setTimeout(() => {
        console.log('Clearing wasRecentlyReset flag');
        setWasRecentlyReset(false);
      }, 10000);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      toast.error('Erro ao reiniciar tutorial');
    }
  };

  return {
    markStepCompleted,
    updateSettings,
    resetOnboarding
  };
};
