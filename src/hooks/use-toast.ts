"use client"

import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({
    title,
    description,
    action,
    variant = "default",
    ...props
  }: ToastProps) => {
    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
        action,
        ...props,
      })
    }
    
    return sonnerToast.success(title, {
      description,
      action,
      ...props,
    })
  }

  return {
    toast,
    toasts: [],
    dismiss: () => {},
  }
}

export const toast = {
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  warning: (message: string, options?: any) => sonnerToast.warning(message, options),
}