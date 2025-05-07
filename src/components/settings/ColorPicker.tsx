
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SwatchBook } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

const defaultColors = [
  "#9b87f5", // Primary Purple (Default)
  "#8B5CF6", // Vivid Purple
  "#D946EF", // Magenta Pink
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#22C55E", // Green
  "#EF4444", // Red
  "#F59E0B", // Yellow
  "#64748B", // Gray
  "#1F2937", // Dark Gray
];

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  colors = defaultColors 
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  const handleManualColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    
    // Only update the actual value if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      onChange(newColor);
    }
  };
  
  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
  };
  
  // Apply the selected color as a preview
  const previewStyle = {
    backgroundColor: value || '#9b87f5'
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-10 h-10 rounded-md border border-gray-200"
        style={previewStyle}
      ></div>
      
      <div className="flex-1">
        <Input
          type="text"
          value={inputValue}
          onChange={handleManualColorChange}
          placeholder="#RRGGBB"
          className="font-mono"
          maxLength={7}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Insira um código de cor hexadecimal (#RRGGBB)
        </p>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            type="button" 
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-100" 
            aria-label="Open color picker"
          >
            <SwatchBook className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="flex flex-wrap gap-2 p-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full border-2",
                  color === value ? "border-gray-900 dark:border-white ring-2 ring-offset-2" : "border-gray-200"
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPicker;
