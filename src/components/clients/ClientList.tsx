
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
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

const ClientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, isLoading, error, deleteClient } = useClients();

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"?`)) {
      try {
        await deleteClient(id);
      } catch (error) {
        toast.error("Erro ao excluir cliente.");
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
        Erro ao carregar clientes. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchTerm ? "Nenhum cliente encontrado com esses critérios." : "Nenhum cliente cadastrado ainda."}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/clients/${client.id}`}>
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

export default ClientList;
