import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LineChart, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { api, formatApiErrorDetail } from "@/services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      toast.success("If the email exists, a reset link was sent.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2" data-testid="fp-brand-link">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <LineChart className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold text-sm">Trade Journal</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 grid place-items-center px-6 pb-12">
        <Card className="w-full max-w-md p-8 border-border">
          <h1 className="font-display font-bold text-3xl">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your email — we&apos;ll send a reset link.</p>
          {!sent ? (
            <form onSubmit={submit} className="mt-8 space-y-5" data-testid="forgot-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-email" />
              </div>
              <Button type="submit" className="w-full" disabled={loading} data-testid="forgot-submit-btn">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send reset link
              </Button>
            </form>
          ) : (
            <div className="mt-8 text-sm text-muted-foreground" data-testid="forgot-sent">
              Check your inbox. If the address is registered, a reset link is on its way.
              <div className="mt-2 text-xs">For local dev, the link is printed in the backend log.</div>
            </div>
          )}
          <div className="mt-6 text-sm text-center text-muted-foreground">
            <Link to="/login" className="hover:underline" data-testid="back-to-login-link">Back to log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
