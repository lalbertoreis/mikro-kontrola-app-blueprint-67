
import React from "react";
import { Calendar, Users, CreditCard, BarChart3, Smartphone, Clock } from "lucide-react";

const ModernFeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gerencie compromissos com visualização diária, semanal e mensal. Evite conflitos e otimize seu tempo.",
      image: "📅",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo com histórico de serviços, preferências e dados de contato organizados.",
      image: "👥",
      color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Monitore receitas, custos e ponto de equilíbrio. Tome decisões baseadas em dados reais.",
      image: "💰",
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Smartphone,
      title: "Agendamento Online",
      description: "Link público para clientes agendarem diretamente. Reduz ligações e facilita o processo.",
      image: "📱",
      color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Análises de performance, clientes mais frequentes e serviços mais vendidos.",
      image: "📊",
      color: "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: Clock,
      title: "Lembretes Automáticos",
      description: "Notificações por WhatsApp para reduzir faltas e manter clientes informados.",
      image: "⏰",
      color: "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
      <div className="kontrola-container">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
            Funcionalidades pensadas especificamente para pequenos negócios e profissionais autônomos que querem crescer de forma organizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Dashboard Preview Section */}
        <div className="mt-16 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4">
              Interface Intuitiva e Moderna
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
              Dashboard completo com todas as informações importantes em uma visão clara e organizada
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-muted-foreground">kontrolaapp.com/dashboard</div>
                </div>
              </div>
              
              <div className="p-4 md:p-8 bg-gradient-to-br from-background to-muted/20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-lg md:rounded-xl">
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
                    <div className="text-lg md:text-2xl font-bold">28</div>
                    <div className="text-xs md:text-sm opacity-90">Agendamentos Hoje</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 md:p-6 rounded-lg md:rounded-xl">
                    <CreditCard className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
                    <div className="text-lg md:text-2xl font-bold">R$ 4.280</div>
                    <div className="text-xs md:text-sm opacity-90">Receita do Mês</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-lg md:rounded-xl">
                    <Users className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
                    <div className="text-lg md:text-2xl font-bold">156</div>
                    <div className="text-xs md:text-sm opacity-90">Clientes Ativos</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-card border border-border p-4 md:p-6 rounded-lg md:rounded-xl">
                    <h4 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Próximos Agendamentos</h4>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded">
                        <div>
                          <div className="text-sm md:text-base font-medium text-foreground">Maria Silva</div>
                          <div className="text-xs md:text-sm text-muted-foreground">Corte + Escova</div>
                        </div>
                        <div className="text-xs md:text-sm font-medium text-foreground">14:00</div>
                      </div>
                      <div className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded">
                        <div>
                          <div className="text-sm md:text-base font-medium text-foreground">João Santos</div>
                          <div className="text-xs md:text-sm text-muted-foreground">Barba + Bigode</div>
                        </div>
                        <div className="text-xs md:text-sm font-medium text-foreground">15:30</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border p-4 md:p-6 rounded-lg md:rounded-xl">
                    <h4 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Performance</h4>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-1">
                          <span>Taxa de Ocupação</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-1">
                          <span>Meta Mensal</span>
                          <span>72%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: {
    icon: React.ElementType;
    title: string;
    description: string;
    image: string;
    color: string;
  };
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const { icon: Icon, title, description, color } = feature;
  
  return (
    <div className="group bg-card border border-border rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl ${color} mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default ModernFeaturesSection;
