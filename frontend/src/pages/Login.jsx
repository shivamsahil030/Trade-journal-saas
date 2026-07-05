import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LineChart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2" data-testid="login-brand-link">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <LineChart className="h-4 w-4" />
            </div>
            <span className="font-display font-bold tracking-tight">Trade Journal</span>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-4xl leading-tight max-w-md">
              Your edge, written down.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Sign in to log a new setup, review past trades, and search your journal instantly.
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground">v1.0 · private · secure</div>
        </div>
      </div>

      <div className="flex flex-col">
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
            <h1 className="font-display font-bold text-3xl">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2">Log in to open your journal.</p>
            <form onSubmit={submit} className="mt-8 space-y-5" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground" data-testid="forgot-password-link">Forgot?</Link>
                </div>
                <div className="relative">
                  <Input id="password"  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" data-testid="input-password" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">

                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              {error && <div className="text-sm text-destructive" data-testid="login-error">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Log in
              </Button>
            </form>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="text-foreground font-medium hover:underline" data-testid="goto-signup-link">Create an account</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
