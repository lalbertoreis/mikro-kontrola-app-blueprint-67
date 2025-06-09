
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProgress, OnboardingSettings } from '@/types/onboarding';

export const useOnboardingData = () => {
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

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  return {
    progress,
    setProgress,
    settings,
    setSettings,
    isLoading,
    loadProgress
  };
};
