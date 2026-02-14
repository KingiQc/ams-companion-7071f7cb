import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["hsl(228,40%,16%)", "hsl(210,100%,52%)", "hsl(38,92%,50%)", "hsl(142,72%,42%)", "hsl(280,60%,50%)", "hsl(0,84%,60%)"];

const ReportsPage = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("policies").select("*"),
      supabase.from("deals").select("*"),
      supabase.from("clients").select("*"),
    ]).then(([p, d, c]) => {
      setPolicies(p.data || []);
      setDeals(d.data || []);
      setClients(c.data || []);
    });
  }, []);

  const hasData = policies.length > 0 || deals.length > 0 || clients.length > 0;

  const policyTypes = policies.reduce<Record<string, number>>((acc, p) => {
    acc[p.type || "Other"] = (acc[p.type || "Other"] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(policyTypes).map(([name, value]) => ({ name, value }));

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-[15px]">Performance analytics and insights.</p>
      </div>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="No data to report" description="Reports will populate as you add clients, policies, and deals." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-[16px]">Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-[15px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Clients</span><span className="font-semibold">{clients.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Policies</span><span className="font-semibold">{policies.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Active Deals</span><span className="font-semibold">{deals.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Premium</span><span className="font-semibold">${policies.reduce((s, p) => s + Number(p.premium || 0), 0).toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          {pieData.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader><CardTitle className="text-[16px]">Policies by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default ReportsPage;
