
// Define the types and steps data for the onboarding flow
export interface OnboardingStep {
  title: string;
  description: string;
  content: string;
  targetSelector: string | null;
  requiresClick: boolean;
  route: string | null;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    title: "Bem-vindo ao KontrolaApp!",
    description: "Guia interativo para começar",
    content: "Preparamos um guia interativo para você configurar seu sistema em poucos passos. Siga as instruções e clique nos elementos indicados.",
    targetSelector: null,
    requiresClick: false,
    route: null
  },
  {
    title: "Serviços",
    description: "Cadastre os serviços que você oferece",
    content: "Clique no menu Serviços para cadastrar os serviços que você oferece ao seu cliente, incluindo duração, preço e descrição.",
    targetSelector: "[data-menu='services']",
    requiresClick: true,
    route: "/dashboard/services"
  },
  {
    title: "Funcionários",
    description: "Adicione seus profissionais",
    content: "Agora clique no menu Funcionários para cadastrar os profissionais que trabalham em seu estabelecimento.",
    targetSelector: "[data-menu='employees']",
    requiresClick: true,
    route: "/dashboard/employees"
  },
  {
    title: "Agenda",
    description: "Configure sua agenda",
    content: "Por último, clique no menu Agenda para configurar seus horários de trabalho e começar a gerenciar seus atendimentos.",
    targetSelector: "[data-menu='calendar']",
    requiresClick: true,
    route: "/dashboard/calendar"
  },
  {
    title: "Tudo pronto!",
    description: "Você está preparado para começar",
    content: "Parabéns! Seu sistema está configurado e pronto para uso. Agora você pode começar a receber agendamentos e gerenciar seu negócio com eficiência.",
    targetSelector: null,
    requiresClick: false,
    route: null
  }
];

export const LOCAL_STORAGE_KEY = 'kontrola-onboarding-dismissed';
