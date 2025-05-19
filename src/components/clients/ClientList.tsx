
import React, { useState, useEffect } from "react";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import ClientDialog from "./ClientDialog";
import ClientSearchBar from "./ClientSearchBar";
import ClientTable from "./ClientTable";
import ClientDeleteDialog from "./ClientDeleteDialog";
import { supabase } from "@/integrations/supabase/client";

const ClientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, isLoading, error, deleteClient, isDeleting } = useClients();
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Log informações sobre o usuário atual
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || null;
      setCurrentUser(userId);
      console.log("Current user ID:", userId);
    };
    
    checkAuth();
  }, []);
  
  // Log da lista de clientes quando ela mudar
  useEffect(() => {
    console.log(`Displaying ${clients?.length || 0} clients`);
  }, [clients]);

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id);
        toast.success(`Cliente "${clientToDelete.name}" excluído com sucesso.`);
      } catch (error) {
        toast.error("Erro ao excluir cliente.");
      } finally {
        setClientToDelete(null);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedClientId(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedClientId(id);
    setDialogOpen(true);
  };

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar clientes. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ClientSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onAddNew={handleAddNew} 
      />

      <ClientTable 
        clients={clients} 
        isLoading={isLoading}
        searchTerm={searchTerm}
        onEditClient={handleEdit}
        onDeleteClient={setClientToDelete}
      />

      <AlertDialog open={!!clientToDelete}>
        <ClientDeleteDialog 
          clientToDelete={clientToDelete}
          isDeleting={isDeleting}
          onCancel={() => setClientToDelete(null)}
          onConfirm={handleDelete}
        />
      </AlertDialog>

      <ClientDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={selectedClientId}
      />
    </div>
  );
};

export default ClientList;
