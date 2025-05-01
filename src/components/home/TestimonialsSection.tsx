
import React from "react";

const testimonials = [
  {
    content: "O KontrolaApp transformou meu salão de beleza. Reduzi as faltas em 70% com as notificações automáticas e o link de agendamento facilitou muito para minhas clientes.",
    author: "Ana Oliveira",
    role: "Cabeleireira",
    avatar: "AO"
  },
  {
    content: "Como fisioterapeuta autônomo, eu precisava de algo simples para gerenciar meus pacientes. O KontrolaApp me ajuda a manter tudo organizado sem complicações.",
    author: "Carlos Santos",
    role: "Fisioterapeuta",
    avatar: "CS"
  },
  {
    content: "A calculadora de preços me ajudou a precificar melhor meus serviços de design. Agora sei exatamente quanto cobrar para ter lucro em cada projeto.",
    author: "Márcia Pereira",
    role: "Designer Freelancer",
    avatar: "MP"
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="kontrola-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
          <p className="text-lg text-gray-600">
            Veja como o KontrolaApp está ajudando empreendedores a simplificar a gestão de seus negócios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
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
  };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const { content, author, role, avatar } = testimonial;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
      <div className="absolute -top-3 left-5">
        <svg width="45" height="36" className="text-kontrola-100 fill-current">
          <path d="M13.415.001C6.07 5.185.887 13.681.887 23.041c0 7.632 4.608 12.096 9.936 12.096 5.04 0 8.784-4.032 8.784-8.784 0-4.752-3.312-8.208-7.632-8.208-.864 0-2.016.144-2.304.288.72-4.896 5.328-10.656 9.936-13.536L13.415.001zm24.768 0c-7.2 5.184-12.384 13.68-12.384 23.04 0 7.632 4.608 12.096 9.936 12.096 4.896 0 8.784-4.032 8.784-8.784 0-4.752-3.456-8.208-7.776-8.208-.864 0-1.872.144-2.16.288.72-4.896 5.184-10.656 9.792-13.536L38.183.001z"></path>
        </svg>
      </div>
      <div className="pt-6">
        <p className="text-gray-600 mb-6">{content}</p>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-kontrola-100 text-kontrola-600 flex items-center justify-center mr-3">
            {avatar}
          </div>
          <div>
            <p className="font-medium text-gray-900">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
