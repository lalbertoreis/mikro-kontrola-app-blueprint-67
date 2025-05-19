
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Client } from "@/types/client";
import ClientTableRow from "./ClientTableRow";

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  onEditClient: (id: string) => void;
  onDeleteClient: (client: { id: string; name: string }) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  isLoading,
  searchTerm,
  onEditClient,
  onDeleteClient
}) => {
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Último Agendamento</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {searchTerm ? "Nenhum cliente encontrado com esses critérios." : "Nenhum cliente cadastrado ainda."}
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client) => (
              <ClientTableRow 
                key={client.id} 
                client={client} 
                onEdit={onEditClient} 
                onDelete={onDeleteClient} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
