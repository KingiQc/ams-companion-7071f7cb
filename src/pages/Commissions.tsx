import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { DollarSign } from "lucide-react";

const CommissionsPage = () => {
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("policies").select("*, clients(name)").eq("status", "active").then(({ data }) => {
      setPolicies(data || []);
    });
  }, []);

  const commissions = policies.map((p) => ({
    ...p,
    commission: Math.round(Number(p.premium) * 0.1),
    rate: "10%",
  }));

  const totalCommission = commissions.reduce((sum, c) => sum + c.commission, 0);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">Commissions</h1>
        <p className="text-muted-foreground text-[15px]">Track your commission earnings.</p>
      </div>

      <Card className="mb-6 border-0 shadow-sm" style={{ background: "hsl(228, 40%, 16%)", color: "#fff" }}>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[13px] opacity-80">Total Commissions (Active Policies)</p>
            <p className="text-[24px] font-bold">${totalCommission.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {commissions.length === 0 ? (
        <EmptyState icon={DollarSign} title="No commissions yet" description="Commissions are calculated from active policies. Add policies to see earnings." />
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <Card key={c.id} className="border shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{c.clients?.name || "—"}</p>
                  <p className="text-[13px] text-muted-foreground">{c.policy_number} · {c.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-muted-foreground">Premium: ${Number(c.premium).toLocaleString()}</span>
                  <Badge variant="outline" className="text-[12px]">Rate: {c.rate}</Badge>
                  <span className="text-[16px] font-bold text-success">${c.commission.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default CommissionsPage;
