
import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    // Convert the file to a base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      {value ? (
        <Avatar className="w-24 h-24">
          <AvatarImage src={value} alt="Logo do negócio" />
          <AvatarFallback className="text-xl">Logo</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center bg-muted">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading}
          className="relative"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          {isLoading ? "Carregando..." : "Upload da Logo"}
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
