import { useState } from "react";
import { Search, Plus, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", type: "individual" });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Error", description: "Client name is required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("clients").insert({
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      type: newClient.type,
      status: "lead",
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Client Added", description: `${newClient.name} has been added successfully.` });
    setNewClient({ name: "", email: "", phone: "", type: "individual" });
    setAddClientOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-20">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, deals, policies..."
            className="pl-10 bg-secondary border-0 h-10 text-[15px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive" />
          </Button>
          <Button onClick={() => setAddClientOpen(true)} className="gap-2 text-[15px]">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </header>

      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Add New Client</DialogTitle>
            <DialogDescription>Enter the client details below to create a new record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[15px]">Full Name *</Label>
              <Input placeholder="e.g. John Doe" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Email</Label>
              <Input type="email" placeholder="e.g. john@email.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Phone</Label>
              <Input placeholder="e.g. (555) 123-4567" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Client Type</Label>
              <Select value={newClient.type} onValueChange={(v) => setNewClient({ ...newClient, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClientOpen(false)}>Cancel</Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
