import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SetupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if any profiles exist
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count && count > 0) {
        navigate("/login");
      } else {
        setHasUsers(false);
      }
    });
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (data.user) {
      // Assign superadmin role
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "superadmin" as any });
      toast({ title: "Setup Complete", description: "Superadmin account created. Signing in..." });
      
      // Sign in
      await supabase.auth.signInWithPassword({ email, password });
      navigate("/");
    }
    setSubmitting(false);
  };

  if (hasUsers === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[480px] border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ background: "hsl(228, 40%, 16%)" }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-[22px] font-semibold">Welcome to InsuraOS</CardTitle>
          <CardDescription className="text-[15px]">Create your superadmin account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[15px]">Full Name</Label>
              <Input placeholder="e.g. John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-[15px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Email</Label>
              <Input type="email" placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} className="text-[15px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Password</Label>
              <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="text-[15px]" />
            </div>
            <Button type="submit" className="w-full text-[15px] h-11" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Superadmin Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
