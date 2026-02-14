import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { CalendarDays, Clock, User } from "lucide-react";

const SchedulePage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("appointments").select("*").order("date", { ascending: true }).then(({ data }) => {
      setAppointments(data || []);
    });
  }, []);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">My Schedule</h1>
        <p className="text-muted-foreground text-[15px]">Upcoming appointments and meetings.</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments scheduled" description="Your scheduled appointments will appear here." />
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">{appt.client_name}</p>
                      <p className="text-[13.5px] text-muted-foreground">{appt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" /> {appt.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {appt.time}
                    </div>
                    <Badge variant="secondary" className="text-[11px] capitalize">{appt.status}</Badge>
                  </div>
                </div>
                {appt.notes && <p className="text-[13px] text-muted-foreground mt-3 italic">"{appt.notes}"</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default SchedulePage;
