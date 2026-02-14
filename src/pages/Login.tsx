import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[420px] border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ background: "hsl(228, 40%, 16%)" }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-[22px] font-semibold">InsuraOS</CardTitle>
          <CardDescription className="text-[15px]">Sign in to your agency management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[15px]">Email</Label>
              <Input
                type="email"
                placeholder="you@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[15px]">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-[15px]"
              />
            </div>
            <Button type="submit" className="w-full text-[15px] h-11" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
