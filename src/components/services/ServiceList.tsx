
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { toast } from "sonner";

const ServiceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { services, isLoading, error, deleteService } = useServices();

  // Filter services based on search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format price as currency
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${name}"?`)) {
      try {
        await deleteService(id);
      } catch (error) {
        toast.error("Erro ao excluir serviço.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar serviços. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/dashboard/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Link>
        </Button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchTerm ? "Nenhum serviço encontrado com esses critérios." : "Nenhum serviço cadastrado ainda."}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{formatDuration(service.duration)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/services/${service.id}`}>
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
