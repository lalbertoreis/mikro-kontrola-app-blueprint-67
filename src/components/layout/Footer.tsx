
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="kontrola-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-kontrola-600 text-white font-bold text-xl p-2 rounded">K</div>
              <span className="text-xl font-semibold text-kontrola-800">KontrolaApp</span>
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              Solução completa para pequenos negócios e autônomos gerenciarem serviços, 
              agenda e relacionamento com clientes de forma simples e eficiente.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-gray-600 hover:text-kontrola-600">
                  Recursos
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-kontrola-600">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-kontrola-600">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-kontrola-600">
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-kontrola-600">
                  Contato
                </Link>
              </li>
              <li>
                <a href="mailto:suporte@kontrolaapp.com" className="text-gray-600 hover:text-kontrola-600">
                  suporte@kontrolaapp.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} KontrolaApp. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-gray-500 text-sm hover:text-kontrola-600">
              Política de Privacidade
            </Link>
            <Link to="/terms" className="text-gray-500 text-sm hover:text-kontrola-600">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
