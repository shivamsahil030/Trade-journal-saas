import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LineChart, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { api, formatApiErrorDetail } from "@/services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = params.get("token") || "";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!token) { setError("Reset token missing"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <LineChart className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold text-sm">Trade Journal</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 grid place-items-center px-6 pb-12">
        <Card className="w-full max-w-md p-8 border-border">
          <h1 className="font-display font-bold text-3xl">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-2">Choose something you&apos;ll remember.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="reset-form">
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="input-new-password" />
            </div>
            {error && <div className="text-sm text-destructive" data-testid="reset-error">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="reset-submit-btn">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
