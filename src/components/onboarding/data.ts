
import { OnboardingStep } from './types';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao KontrolaApp! 🎉',
    description: 'Vamos configurar seu sistema em poucos passos',
    content: 'Este tutorial irá te guiar através das funcionalidades principais do sistema. Você pode pular o tutorial a qualquer momento ou retomar de onde parou.',
    completed: false
  },
  {
    id: 'services',
    title: 'Configure seus Serviços',
    description: 'Adicione os serviços que você oferece',
    content: 'Comece cadastrando os serviços que você oferece aos seus clientes. Defina preços, duração e descrições.',
    targetSelector: '[data-menu="services"]',
    route: '/dashboard/services',
    completed: false
  },
  {
    id: 'employees',
    title: 'Adicione seus Funcionários',
    description: 'Cadastre sua equipe',
    content: 'Adicione os profissionais que trabalham com você. Configure os horários e serviços de cada um.',
    targetSelector: '[data-menu="employees"]',
    route: '/dashboard/employees',
    completed: false
  },
  {
    id: 'calendar',
    title: 'Configure sua Agenda',
    description: 'Organize seus horários',
    content: 'Configure os horários de funcionamento e comece a gerenciar seus agendamentos.',
    targetSelector: '[data-menu="calendar"]',
    route: '/dashboard/calendar',
    completed: false
  },
  {
    id: 'complete',
    title: 'Tudo pronto! ✨',
    description: 'Seu sistema está configurado',
    content: 'Parabéns! Agora você pode começar a usar o KontrolaApp para gerenciar seu negócio com eficiência.',
    completed: false
  }
];
