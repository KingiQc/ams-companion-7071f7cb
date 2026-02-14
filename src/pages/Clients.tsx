import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { Search, User, Building2, Mail, Phone, Users } from "lucide-react";

const ClientsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("clients").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setClients(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">All Clients</h1>
        <p className="text-muted-foreground text-[15px]">Manage your client relationships.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-10 bg-secondary border-0 text-[15px]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] text-[15px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No clients found" description="Add your first client using the button in the header to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {client.type === "business" ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">{client.name}</p>
                      <p className="text-[13px] text-muted-foreground capitalize">{client.type}</p>
                    </div>
                  </div>
                  <Badge variant={client.status === "active" ? "default" : client.status === "lead" ? "secondary" : "outline"} className="text-[11px] capitalize">{client.status}</Badge>
                </div>
                <div className="space-y-1.5 text-[13.5px] text-muted-foreground">
                  {client.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{client.email}</div>}
                  {client.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{client.phone}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ClientsPage;
