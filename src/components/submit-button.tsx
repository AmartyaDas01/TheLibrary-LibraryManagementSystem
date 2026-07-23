"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * A submit button that reflects the pending state of its enclosing <form>.
 * Disables and shows a spinner while the server action runs.
 */
export function SubmitButton({
  children,
  pendingText,
  disabled,
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      {...props}
    >
      {pending && <Loader2 className="animate-spin" />}
      {pending ? (pendingText ?? children) : children}
    </Button>
  );
}
