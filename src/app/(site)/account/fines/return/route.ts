import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

// Stripe sends the member here after Checkout. Verify the session really was
// paid before marking the fine settled, then send them back to their shelf.
export async function GET(req: NextRequest) {
  const back = (query: string) =>
    NextResponse.redirect(new URL(`/account${query}`, req.url));

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const sessionId = req.nextUrl.searchParams.get("session_id");
  const stripe = getStripe();
  if (!sessionId || !stripe) return back("");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const fineId = session.metadata?.fineId;
    const paid = session.payment_status === "paid";
    const ownsSession = session.metadata?.userId === user.id;

    if (paid && ownsSession && fineId) {
      await prisma.fine.updateMany({
        where: { id: fineId, userId: user.id },
        data: { paid: true },
      });
      return back("?paid=1");
    }
  } catch {
    // fall through to the failure redirect
  }

  return back("?payment=failed");
}
