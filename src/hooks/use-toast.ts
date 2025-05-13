
import { useToast as useToastInternal } from "@/components/ui/toast";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type { ToastProps };

export const useToast = () => useToastInternal();

export interface ToastActionElementProps {
  altText?: string;
  action: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const toast = useToastInternal;
