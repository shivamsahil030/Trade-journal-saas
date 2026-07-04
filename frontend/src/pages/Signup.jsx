import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LineChart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email || !form.password) { setError("All fields are required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await register(form.email.trim(), form.password, form.name.trim());
    setLoading(false);
    if (res.ok) {
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col order-2 lg:order-1">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <LineChart className="h-3.5 w-3.5" />
            </div>
            <span className="font-display font-bold text-sm">Trade Journal</span>
          </Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="flex-1 grid place-items-center px-6 pb-12">
          <Card className="w-full max-w-md p-8 border-border">
            <h1 className="font-display font-bold text-3xl">Create your journal</h1>
            <p className="text-sm text-muted-foreground mt-2">Free forever. Ready in 30 seconds.</p>
            <form onSubmit={submit} className="mt-8 space-y-5" data-testid="signup-form">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" data-testid="input-password" />
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              </div>
              {error && <div className="text-sm text-destructive" data-testid="signup-error">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-btn">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create account
              </Button>
            </form>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              Already a member?{" "}
              <Link to="/login" className="text-foreground font-medium hover:underline" data-testid="goto-login-link">Log in</Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden border-l border-border order-1 lg:order-2">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2" data-testid="signup-brand-link">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <LineChart className="h-4 w-4" />
            </div>
            <span className="font-display font-bold tracking-tight">Trade Journal</span>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-4xl leading-tight max-w-md">
              Start compounding lessons — today.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Log your first trade in under a minute. Your journal, your rules.
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground">v1.0 · private · secure</div>
        </div>
      </div>
    </div>
  );
}
