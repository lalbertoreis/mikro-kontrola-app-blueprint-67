
import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    content: "O KontrolaApp revolucionou meu salão! Reduzi as faltas em 70% com as notificações automáticas. Minha agenda ficou mais organizada e meus clientes adoram poder agendar pelo link.",
    author: "Ana Oliveira",
    role: "Proprietária - Salão Bella Vista",
    avatar: "AO",
    rating: 5,
    metrics: "70% menos faltas"
  },
  {
    content: "Como fisioterapeuta, eu precisava de algo simples mas completo. O controle financeiro me ajudou a precificar melhor e o sistema de agendamento economiza horas do meu dia.",
    author: "Carlos Santos",
    role: "Fisioterapeuta Autônomo",
    avatar: "CS",
    rating: 5,
    metrics: "5h economizadas/dia"
  },
  {
    content: "A calculadora de preços foi um divisor de águas! Agora sei exatamente quanto cobrar para ter lucro. O sistema é intuitivo e o suporte é excepcional.",
    author: "Márcia Pereira",
    role: "Designer & Consultora",
    avatar: "MP",
    rating: 5,
    metrics: "30% mais lucro"
  },
];

const ModernTestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="kontrola-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-sm font-medium text-yellow-700 border border-yellow-200 mb-6">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Avaliação 4.9/5 estrelas
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Mais de 1.000 profissionais
            <span className="block text-kontrola-600">já transformaram seus negócios</span>
          </h2>
          <p className="text-xl text-gray-600">
            Veja como o KontrolaApp está ajudando empreendedores a crescer e prosperar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-kontrola-600 rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-kontrola-100">Profissionais ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-kontrola-100">Agendamentos realizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">70%</div>
              <div className="text-kontrola-100">Redução de faltas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-kontrola-100">Avaliação média</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: {
    content: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    metrics: string;
  };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const { content, author, role, avatar, rating, metrics } = testimonial;
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative">
      {/* Quote Icon */}
      <div className="absolute -top-4 left-8">
        <div className="w-8 h-8 bg-kontrola-600 rounded-full flex items-center justify-center">
          <Quote className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4 pt-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-6 leading-relaxed">{content}</p>

      {/* Metrics */}
      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-block mb-6">
        {metrics}
      </div>

      {/* Author */}
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-kontrola-100 text-kontrola-600 flex items-center justify-center mr-4 font-semibold">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default ModernTestimonialsSection;
