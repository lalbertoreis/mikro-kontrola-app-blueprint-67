
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

interface ClientSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddNew 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="relative w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onAddNew}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Cliente
      </Button>
    </div>
  );
};

export default ClientSearchBar;
