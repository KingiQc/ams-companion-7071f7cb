import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pipelineStages } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";

const PipelinePage = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("deals").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setDeals(data || []);
    });
  }, []);

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
        <h1 className="text-[22px] font-semibold text-foreground">Deals Pipeline</h1>
        <p className="text-muted-foreground text-[15px]">Track and manage your sales pipeline.</p>
      </div>

      {deals.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No deals in the pipeline" description="Create your first deal to start tracking your sales pipeline." />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {pipelineStages.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              return (
                <div key={stage.id} className="w-[290px] shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
                    <span className="text-[14px] font-semibold text-foreground">{stage.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[12px]">{stageDeals.length}</Badge>
                  </div>
                  <div className="space-y-3 min-h-[100px]">
                    {stageDeals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground text-[13px]">No deals</div>
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
                            <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
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
    </AppLayout>
  );
};

export default PipelinePage;
