
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OnboardingProgress {
  step_id: string;
  completed: boolean;
  completed_at: string | null;
}

interface OnboardingSettings {
  dont_show_again: boolean;
  current_step_index: number;
  is_completed: boolean;
}

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [settings, setSettings] = useState<OnboardingSettings>({
    dont_show_again: false,
    current_step_index: 0,
    is_completed: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar progresso do banco
  const loadProgress = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Carregar progresso dos passos
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error loading onboarding progress:', progressError);
        return;
      }

      // Carregar configurações
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_onboarding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) {
        console.error('Error loading onboarding settings:', settingsError);
        return;
      }

      setProgress(progressData || []);
      
      if (settingsData) {
        setSettings({
          dont_show_again: settingsData.dont_show_again,
          current_step_index: settingsData.current_step_index,
          is_completed: settingsData.is_completed
        });
      }
    } catch (error) {
      console.error('Error in loadProgress:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Detectar e marcar passos automaticamente baseado nos dados
  const detectAndMarkCompletedSteps = async (servicesCount: number, employeesCount: number) => {
    if (!user || isLoading) return;

    console.log('Detecting completed steps:', { servicesCount, employeesCount });

    const stepsToCheck = [];

    // Verificar se serviços foram adicionados
    if (servicesCount > 0) {
      const servicesProgress = progress.find(p => p.step_id === 'services');
      if (!servicesProgress?.completed) {
        console.log('Auto-completing services step');
        stepsToCheck.push('services');
      }
    }

    // Verificar se funcionários foram adicionados
    if (employeesCount > 0) {
      const employeesProgress = progress.find(p => p.step_id === 'employees');
      if (!employeesProgress?.completed) {
        console.log('Auto-completing employees step');
        stepsToCheck.push('employees');
      }
    }

    // Marcar todos os passos detectados como completos
    for (const stepId of stepsToCheck) {
      await markStepCompleted(stepId);
    }
  };

  // Atualizar configurações - CORRIGIDO para evitar conflitos
  const updateSettings = async (newSettings: Partial<OnboardingSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Primeiro, tentar buscar o registro existente
      const { data: existingSettings } = await supabase
        .from('user_onboarding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        // Se existe, fazer update
        result = await supabase
          .from('user_onboarding_settings')
          .update({
            dont_show_again: updatedSettings.dont_show_again,
            current_step_index: updatedSettings.current_step_index,
            is_completed: updatedSettings.is_completed
          })
          .eq('user_id', user.id);
      } else {
        // Se não existe, fazer insert
        result = await supabase
          .from('user_onboarding_settings')
          .insert({
            user_id: user.id,
            dont_show_again: updatedSettings.dont_show_again,
            current_step_index: updatedSettings.current_step_index,
            is_completed: updatedSettings.is_completed
          });
      }

      if (result.error) {
        console.error('Error updating onboarding settings:', result.error);
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

  // Resetar onboarding - CORRIGIDO para persistir no banco
  const resetOnboarding = async () => {
    if (!user) return;

    try {
      console.log('Resetting onboarding - clearing progress and settings');
      
      // Limpar progresso
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error clearing progress:', progressError);
        toast.error('Erro ao limpar progresso');
        return;
      }

      // Resetar configurações no banco
      await updateSettings({
        dont_show_again: false,
        current_step_index: 0,
        is_completed: false
      });

      // Limpar estado local
      setProgress([]);
      
      console.log('Onboarding reset completed');
      toast.success('Tutorial reiniciado');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      toast.error('Erro ao reiniciar tutorial');
    }
  };

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  return {
    progress,
    settings,
    isLoading,
    markStepCompleted,
    updateSettings,
    resetOnboarding,
    loadProgress,
    detectAndMarkCompletedSteps
  };
};
