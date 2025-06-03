
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
  const [wasRecentlyReset, setWasRecentlyReset] = useState(false);

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

  // Detectar e marcar passos automaticamente baseado nos dados - MUITO MAIS CONSERVADOR
  const detectAndMarkCompletedSteps = async (servicesCount: number, employeesCount: number) => {
    if (!user || isLoading || wasRecentlyReset) {
      console.log('Skipping auto-detection:', { 
        noUser: !user, 
        isLoading, 
        wasRecentlyReset 
      });
      return;
    }

    console.log('Detecting completed steps:', { 
      servicesCount, 
      employeesCount, 
      progressCount: progress.length,
      hasAnyCompletedProgress: progress.some(p => p.completed === true)
    });

    // Se já existe QUALQUER progresso registrado como completo, não fazer detecção automática
    if (progress.some(p => p.completed === true)) {
      console.log('Completed progress already exists, skipping auto-detection');
      return;
    }

    // Se não há serviços nem funcionários, não há nada para detectar
    if (servicesCount === 0 && employeesCount === 0) {
      console.log('No services or employees to detect');
      return;
    }

    const stepsToCheck = [];

    // Verificar se serviços foram adicionados
    if (servicesCount > 0) {
      console.log('Auto-completing services step');
      stepsToCheck.push('services');
    }

    // Verificar se funcionários foram adicionados
    if (employeesCount > 0) {
      console.log('Auto-completing employees step');
      stepsToCheck.push('employees');
    }

    // Marcar todos os passos detectados como completos
    for (const stepId of stepsToCheck) {
      await markStepCompleted(stepId);
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
      
      // Remover a flag de reset após 3 segundos para permitir futuras detecções
      setTimeout(() => {
        setWasRecentlyReset(false);
      }, 3000);
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
