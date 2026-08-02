"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const POPOVER_WIDTH = 256;

function ConfirmSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

/**
 * An icon-only delete trigger that expands into an inline confirm popover
 * instead of firing the destructive action immediately on click. Renders via
 * a portal so it isn't clipped by scroll containers or rounded-corner cards.
 */
export function ConfirmDeleteButton({
  action,
  hiddenName,
  hiddenValue,
  itemLabel,
  disabled,
  disabledReason,
}: {
  action: (formData: FormData) => void;
  hiddenName: string;
  hiddenValue: string;
  itemLabel: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = 120;

    let left = rect.right - POPOVER_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - POPOVER_WIDTH - 8));

    let top = rect.bottom + 8;
    if (top + estimatedHeight > window.innerHeight) {
      top = rect.top - estimatedHeight - 8;
    }

    setCoords({ top, left });
  }, [open]);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open, coords]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        aria-label={`Delete ${itemLabel}`}
        title={disabled ? disabledReason : `Delete ${itemLabel}`}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Trash2 />
      </Button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={`Confirm delete ${itemLabel}`}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            style={{ top: coords.top, left: coords.left, width: POPOVER_WIDTH }}
            className="fixed z-50 rounded-lg border border-border bg-card p-3.5 text-left shadow-lg"
          >
            <p className="text-sm text-foreground">
              Delete <span className="font-medium">{itemLabel}</span>? This
              can&apos;t be undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                ref={cancelRef}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <form action={action}>
                <input type="hidden" name={hiddenName} value={hiddenValue} />
                <ConfirmSubmitButton />
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
