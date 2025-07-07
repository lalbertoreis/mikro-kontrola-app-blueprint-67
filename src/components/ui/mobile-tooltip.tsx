import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MobileTooltipProps {
  content: string;
  className?: string;
}

const MobileTooltip: React.FC<MobileTooltipProps> = ({ content, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          type="button" 
          className={`ml-1 ${className}`}
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="max-w-xs text-sm"
        sideOffset={4}
      >
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  );
};

export default MobileTooltip;