import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserCog, Ban, CheckCircle, Trash2, Users, Loader2 } from "lucide-react";

interface ManagedUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_suspended: boolean;
  created_at: string;
  user_roles: { role: string }[];
}

const UserManagementPage = () => {
  const { session, role } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", role: "admin" });

  const callManageUsers = async (payload: any) => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: payload,
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const fetchUsers = async () => {
    try {
      const data = await callManageUsers({ action: "list_users" });
      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "superadmin") fetchUsers();
    else setLoading(false);
  }, [role]);

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await callManageUsers({ action: "create_user", ...newUser });
      toast({ title: "User Created", description: `${newUser.full_name} has been added as ${newUser.role}` });
      setNewUser({ email: "", password: "", full_name: "", role: "admin" });
      setCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await callManageUsers({ action: "suspend_user", user_id: userId });
      toast({ title: "User Suspended" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      await callManageUsers({ action: "unsuspend_user", user_id: userId });
      toast({ title: "User Unsuspended" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await callManageUsers({ action: "delete_user", user_id: userId });
      toast({ title: "User Deleted" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (role !== "superadmin") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <UserCog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-[17px] font-semibold text-foreground mb-1">Access Denied</p>
            <p className="text-[15px] text-muted-foreground">Only superadmins can manage users.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-[15px]">Create, suspend, and manage team accounts.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 text-[15px]">
          <Plus className="w-4 h-4" /> Create User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-[17px] font-semibold text-foreground mb-1">No users yet</p>
            <p className="text-[15px] text-muted-foreground mb-4">Create your first team member to get started.</p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const userRole = u.user_roles?.[0]?.role || "—";
            const isSelf = u.user_id === session?.user?.id;
            return (
              <Card key={u.id} className="border shadow-sm">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCog className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">
                        {u.full_name || "Unnamed"} {isSelf && <span className="text-muted-foreground text-[13px]">(you)</span>}
                      </p>
                      <p className="text-[13px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-[12px] capitalize">{userRole}</Badge>
                    {u.is_suspended ? (
                      <Badge variant="destructive" className="text-[11px]">Suspended</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">Active</Badge>
                    )}
                    {!isSelf && (
                      <div className="flex gap-1.5">
                        {u.is_suspended ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnsuspend(u.user_id)} className="gap-1 text-[13px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Unsuspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleSuspend(u.user_id)} className="gap-1 text-[13px]">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u.user_id)} className="gap-1 text-[13px]">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[15px]">Full Name *</Label>
              <Input placeholder="e.g. Jane Doe" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Email *</Label>
              <Input type="email" placeholder="e.g. jane@agency.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Password *</Label>
              <Input type="password" placeholder="Min 6 characters" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Role *</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UserManagementPage;
