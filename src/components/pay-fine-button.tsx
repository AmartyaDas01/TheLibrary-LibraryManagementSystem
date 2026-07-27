"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFineOrder, settleFinePayment } from "@/lib/actions";

// Razorpay's checkout.js attaches a global constructor when loaded.
type RazorpayInstance = { open: () => void; on: (e: string, cb: () => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function PayFineButton({ fineId }: { fineId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setLoading(true);
    setError(null);
    try {
      const order = await createFineOrder(fineId);

      if (order.status === "settled") {
        router.refresh();
        return;
      }
      if (order.status === "error") {
        setError(order.message);
        return;
      }

      const loaded = await loadCheckout();
      if (!loaded || !window.Razorpay) {
        setError("Could not open the payment window.");
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: order.name,
        description: order.description,
        prefill: order.prefill,
        theme: { color: "#1e5540" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const res = await settleFinePayment({
            fineId,
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
          if (res.ok) router.refresh();
          else setError("We couldn't confirm that payment.");
        },
        modal: { ondismiss: () => setLoading(false) },
      } as Record<string, unknown>);

      rzp.on("payment.failed", () => setError("Payment failed. Please try again."));
      rzp.open();
    } catch {
      setError("Something went wrong starting the payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="accent" onClick={onPay} disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Pay with card
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
