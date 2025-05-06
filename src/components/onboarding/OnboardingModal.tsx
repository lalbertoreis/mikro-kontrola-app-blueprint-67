
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'kontrola-onboarding-dismissed';

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the onboarding
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bem-vindo ao KontrolaApp!</DialogTitle>
          <DialogDescription className="text-base">
            Vamos configurar seu sistema em poucos passos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">1. Cadastre seus serviços</h3>
            <p className="text-muted-foreground">
              Comece cadastrando os serviços que você oferece, incluindo duração, preço e descrição.
            </p>
            <Button variant="outline" asChild className="mt-2">
              <Link to="/dashboard/services">Cadastrar Serviços</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">2. Adicione seus funcionários</h3>
            <p className="text-muted-foreground">
              Cadastre os profissionais que trabalham em seu estabelecimento.
            </p>
            <Button variant="outline" asChild className="mt-2">
              <Link to="/dashboard/employees">Cadastrar Funcionários</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">3. Configure a agenda</h3>
            <p className="text-muted-foreground">
              Defina horários de trabalho, serviços realizados por cada profissional e comece a gerenciar sua agenda.
            </p>
            <Button variant="outline" asChild className="mt-2">
              <Link to="/dashboard/calendar">Ir para Agenda</Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox id="dontShow" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(checked === true)} />
            <label htmlFor="dontShow" className="text-sm font-medium leading-none cursor-pointer">
              Não mostrar novamente
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleDismiss}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
