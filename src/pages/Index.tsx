import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, CalendarDays, Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pipelineStages } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [c, d, a, p] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("deals").select("*"),
        supabase.from("appointments").select("*").eq("status", "upcoming"),
        supabase.from("policies").select("*").eq("status", "active"),
      ]);
      setClients(c.data || []);
      setDeals(d.data || []);
      setAppointments(a.data || []);
      setPolicies(p.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const pipelineValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);

  const statCards = [
    { label: "Total Clients", value: clients.length.toString(), icon: Users, color: "hsl(228, 40%, 16%)", fgColor: "#fff" },
    { label: "Assets Under Management", value: `$${(totalPremium / 1000000).toFixed(1)}M`, icon: DollarSign, color: "hsl(228, 40%, 16%)", fgColor: "#fff" },
    { label: "Pipeline Value", value: `$${(pipelineValue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "hsl(228, 40%, 16%)", fgColor: "#fff" },
    { label: "Appointments", value: appointments.length.toString(), icon: CalendarDays, color: "hsl(var(--secondary))", fgColor: "hsl(0,0%,11%)" },
  ];

  const handleMoveStage = async (dealId: string, newStage: string) => {
    await supabase.from("deals").update({ stage: newStage }).eq("id", dealId);
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));
    const deal = deals.find((d) => d.id === dealId);
    const stage = pipelineStages.find((s) => s.id === newStage);
    toast({ title: "Deal Updated", description: `${deal?.client_name} moved to "${stage?.name}"` });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-[15px]">Welcome back — here's your agency overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm" style={{ background: stat.color, color: stat.fgColor }}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.fgColor }} />
              </div>
              <div>
                <p className="text-[13px] opacity-80">{stat.label}</p>
                <p className="text-[22px] font-bold leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Pipeline */}
      <div className="mb-8">
        <h2 className="text-[17px] font-semibold text-foreground mb-4">Sales Pipeline</h2>
        {deals.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No deals yet" description="Create your first deal to see it in the pipeline." />
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-2">
              {pipelineStages.slice(0, 4).map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage.id);
                return (
                  <div key={stage.id} className="w-[280px] shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
                      <span className="text-[14px] font-semibold text-foreground">{stage.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[12px]">{stageDeals.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {stageDeals.length === 0 && (
                        <div className="rounded-lg border border-dashed border-border p-4 text-center text-muted-foreground text-[13px]">No deals</div>
                      )}
                      {stageDeals.map((deal) => (
                        <Card key={deal.id} className="border shadow-sm">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-[15px] font-semibold text-foreground">{deal.client_name}</p>
                                <p className="text-[13px] text-muted-foreground">{deal.policy_type}</p>
                              </div>
                              <Badge variant={deal.priority === "hot" ? "destructive" : deal.priority === "warm" ? "default" : "secondary"} className="text-[11px] capitalize">{deal.priority}</Badge>
                            </div>
                            <p className="text-[16px] font-bold text-foreground">${Number(deal.value).toLocaleString()}</p>
                            <Select value={deal.stage} onValueChange={(v) => handleMoveStage(deal.id, v)}>
                              <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="Move to stage" /></SelectTrigger>
                              <SelectContent>
                                {pipelineStages.map((s) => (<SelectItem key={s.id} value={s.id} className="text-[13px]">{s.name}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-[17px] font-semibold text-foreground mb-4">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming appointments" description="Schedule an appointment to see it here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.slice(0, 3).map((appt) => (
              <Card key={appt.id} className="border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-info" />
                    <span className="text-[13px] text-muted-foreground">{appt.date} · {appt.time}</span>
                  </div>
                  <p className="text-[15px] font-semibold text-foreground">{appt.client_name}</p>
                  <p className="text-[13.5px] text-muted-foreground">{appt.type}</p>
                  {appt.notes && <p className="text-[12.5px] text-muted-foreground mt-2 italic">"{appt.notes}"</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
