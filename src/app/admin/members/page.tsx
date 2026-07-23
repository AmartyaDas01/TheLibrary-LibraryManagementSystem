import type { Metadata } from "next";
import { getMembers } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div>
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Members
        </h1>
        <p className="mt-1 text-muted-foreground">
          {members.length} registered readers.
        </p>
      </header>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium tabular">Membership</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">On loan</th>
                <th className="px-4 py-3 font-medium">Fines due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => {
                const unpaid = m.fines.reduce((s, f) => s + f.amount, 0);
                return (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                          {initials(m.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{m.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular text-muted-foreground">
                      {m.membershipId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={m.loans.length > 0 ? "info" : "neutral"}>
                        {m.loans.length} book{m.loans.length === 1 ? "" : "s"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {unpaid > 0 ? (
                        <Badge tone="warning">{formatCurrency(unpaid)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
