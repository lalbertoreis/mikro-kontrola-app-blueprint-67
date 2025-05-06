
import React from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            "w-8 h-8 rounded-full border-2",
            color === value ? "border-gray-900 dark:border-white ring-2 ring-offset-2" : "border-gray-200"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
