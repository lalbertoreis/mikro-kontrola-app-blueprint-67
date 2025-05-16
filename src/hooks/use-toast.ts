
import * as React from "react";
import { toast as sonnerToast } from "sonner";

// Types for our toast - these are based on the shadcn/ui toast component
type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterActionType = 
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string };

// Initial state
const toastState = {
  toasts: [] as ToasterToast[],
};

export function useToast() {
  const [state, dispatch] = React.useReducer(
    (state: typeof toastState, action: ToasterActionType): typeof toastState => {
      switch (action.type) {
        case "ADD_TOAST":
          return {
            ...state,
            toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
          };

        case "UPDATE_TOAST":
          return {
            ...state,
            toasts: state.toasts.map((t) =>
              t.id === action.toast.id ? { ...t, ...action.toast } : t
            ),
          };

        case "DISMISS_TOAST": {
          return {
            ...state,
            toasts: state.toasts.map((t) =>
              t.id === action.toastId ? { ...t } : t
            ),
          };
        }

        case "REMOVE_TOAST":
          return {
            ...state,
            toasts: state.toasts.filter((t) => t.id !== action.toastId),
          };

        default:
          return state;
      }
    },
    toastState
  );

  React.useEffect(() => {
    return () => {};
  }, [state.toasts]);

  const toast = React.useMemo(() => {
    // Use sonner toast internally
    const showToast = ({
      title,
      description,
      variant = "default",
      ...props
    }: Omit<ToasterToast, "id">) => {
      // Use sonner's toast with our parameters
      if (variant === "destructive") {
        sonnerToast.error(title, { description });
      } else {
        sonnerToast(title, { description });
      }
    };

    return {
      ...showToast,
      dismiss: (toastId: string) => {},
      toast: showToast,
    };
  }, []);

  return {
    ...toast,
    toasts: state.toasts,
  };
}

// Export the simpler toast function from sonner directly
export const toast = sonnerToast;

export type { ToasterToast as ToastProps };

export interface ToastActionElementProps {
  altText?: string;
  action: () => void;
  className?: string;
  children?: React.ReactNode;
}

// For compatibility with existing code
export type ToastActionElement = React.ReactElement;
