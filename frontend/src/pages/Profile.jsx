import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const initials = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile(name.trim());
    setSaving(false);
    if (res.ok) toast.success("Profile updated");
    else toast.error(res.error);
  };

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Account</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-2">Profile</h1>

        <Card className="p-6 mt-8 border-border">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 text-xl"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <div className="font-display font-bold text-lg truncate">{user?.name || "Trader"}</div>
              <div className="text-sm text-muted-foreground font-mono truncate">{user?.email}</div>
            </div>
          </div>

          <form onSubmit={save} className="mt-8 space-y-5" data-testid="profile-form">
            <div className="space-y-2">
              <Label htmlFor="pname">Display name</Label>
              <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <Button type="submit" disabled={saving} data-testid="profile-save-btn">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes
            </Button>
          </form>
        </Card>

        <Card className="p-6 mt-6 border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-bold">Log out</div>
              <div className="text-sm text-muted-foreground">End your session on this device.</div>
            </div>
            <Button variant="outline" onClick={doLogout} data-testid="profile-logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
