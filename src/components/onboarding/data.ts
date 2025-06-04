
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Sistema!',
    description: 'Vamos configurar seu negócio',
    content: 'Este tutorial irá te guiar pelos primeiros passos para configurar seu sistema de agendamento.',
    targetSelector: null,
    route: null
  },
  {
    id: 'services',
    title: 'Cadastre seus Serviços',
    description: 'Defina os serviços que você oferece',
    content: 'Adicione os serviços do seu negócio com preços, duração e outras configurações.',
    targetSelector: '[data-menu="services"]',
    route: '/dashboard/services'
  },
  {
    id: 'employees',
    title: 'Adicione seus Funcionários',
    description: 'Cadastre sua equipe',
    content: 'Adicione os profissionais que trabalham com você. Configure os horários e serviços de cada um.',
    targetSelector: '[data-menu="employees"]',
    route: '/dashboard/employees'
  },
  {
    id: 'clients',
    title: 'Cadastre seus Clientes',
    description: 'Adicione seus clientes',
    content: 'Cadastre seus clientes para facilitar o agendamento e manter um histórico organizado.',
    targetSelector: '[data-menu="clients"]',
    route: '/dashboard/clients'
  },
  {
    id: 'booking-settings',
    title: 'Configurações de Agendamento',
    description: 'Configure como funciona seu agendamento',
    content: 'Configure horários de funcionamento, intervalo entre atendimentos e outras configurações importantes.',
    targetSelector: '[data-menu="settings"]',
    route: '/dashboard/settings'
  },
  {
    id: 'calendar',
    title: 'Gerencie sua Agenda',
    description: 'Aprenda a usar o calendário',
    content: 'Visualize e gerencie seus agendamentos. Aprenda a criar novos agendamentos manualmente.',
    targetSelector: '[data-menu="calendar"]',
    route: '/dashboard/calendar'
  },
  {
    id: 'holidays',
    title: 'Configure Feriados',
    description: 'Defina os dias que não funcionará',
    content: 'Importe feriados nacionais e adicione datas personalizadas quando não haverá atendimento.',
    targetSelector: '[data-menu="holidays"]',
    route: '/dashboard/holidays'
  },
  {
    id: 'payment-methods',
    title: 'Métodos de Pagamento',
    description: 'Configure formas de pagamento',
    content: 'Adicione os métodos de pagamento que você aceita para organizar melhor suas finanças.',
    targetSelector: '[data-menu="payment-methods"]',
    route: '/dashboard/payment-methods'
  },
  {
    id: 'fixed-costs',
    title: 'Custos Fixos',
    description: 'Cadastre seus custos mensais',
    content: 'Adicione seus custos fixos para ter um controle financeiro completo do seu negócio.',
    targetSelector: '[data-menu="fixed-costs"]',
    route: '/dashboard/fixed-costs'
  },
  {
    id: 'finance',
    title: 'Controle Financeiro',
    description: 'Acompanhe suas finanças',
    content: 'Visualize relatórios financeiros, receitas, despesas e tenha controle total do seu negócio.',
    targetSelector: '[data-menu="finance"]',
    route: '/dashboard/finance'
  },
  {
    id: 'complete',
    title: 'Configuração Concluída!',
    description: 'Seu sistema está pronto',
    content: 'Parabéns! Você configurou com sucesso seu sistema de agendamento. Agora está tudo pronto para começar a atender seus clientes.',
    targetSelector: null,
    route: null
  }
];
