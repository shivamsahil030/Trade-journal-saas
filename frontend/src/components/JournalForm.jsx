import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { api, formatApiErrorDetail } from "@/services/api";

const SETUPS = ["Breakout", "Pullback", "CPR", "Trendline", "Support & Resistance", "Moving Average", "Other"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const DRAFT_KEY = "trade_journal_draft";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalForm({ initial = null, mode = "create" }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    trade_date: initial?.trade_date || todayISO(),
    stock_name: initial?.stock_name || "",
    trade_setup: initial?.trade_setup || "",
    trade_logic: initial?.trade_logic || "",
    lesson_learned: initial?.lesson_learned || "",
    tags: initial?.tags?.join(", ") || "",
    screenshot: initial?.screenshot || "",
  }));
  const [errors, setErrors] = useState({});

  // Auto-save draft (create mode only)
  useEffect(() => {
    if (mode !== "create") return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { }
  }, [form, mode]);

  useEffect(() => {
    if (mode !== "create" || initial) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === "object") setForm((f) => ({ ...f, ...d }));
      }
    } catch { }
  }, [mode, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is too large. Max 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("screenshot", reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.trade_date) e.trade_date = "Required";
    if (!form.stock_name.trim()) e.stock_name = "Required";
    if (!form.trade_setup) e.trade_setup = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      trade_date: form.trade_date,
      stock_name: form.stock_name.trim(),
      trade_setup: form.trade_setup,
      trade_logic: form.trade_logic,
      lesson_learned: form.lesson_learned,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      screenshot: form.screenshot || null,
    };
    try {
      if (mode === "create") {
        const { data } = await api.post("/journals", payload);
        console.log("API Response:", data);
        console.log("Journal ID:", data.journal.id);
        toast.success("Journal saved");
        try { localStorage.removeItem(DRAFT_KEY); } catch { }
        navigate(`/dashboard/${data.journal.id}`);
      } else {
        const { data } = await api.put(`/journals/${initial.id}`, payload);
        toast.success("Journal updated");
        navigate(`/dashboard/${data.journal.id}`);
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8" data-testid="journal-form">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trade_date">Trade date</Label>
          <Input
            id="trade_date" type="date" value={form.trade_date}
            onChange={(e) => set("trade_date", e.target.value)}
            data-testid="input-trade-date"
          />
          {errors.trade_date && <p className="text-xs text-destructive">{errors.trade_date}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_name">Stock / Ticker</Label>
          <Input
            id="stock_name" placeholder="e.g. AAPL" value={form.stock_name}
            onChange={(e) => set("stock_name", e.target.value)}
            data-testid="input-stock-name"
          />
          {errors.stock_name && <p className="text-xs text-destructive">{errors.stock_name}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trade setup</Label>
        <Select value={form.trade_setup} onValueChange={(v) => set("trade_setup", v)}>
          <SelectTrigger data-testid="select-trade-setup"><SelectValue placeholder="Select a setup" /></SelectTrigger>
          <SelectContent>
            {SETUPS.map((s) => (
              <SelectItem key={s} value={s} data-testid={`setup-option-${s}`}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.trade_setup && <p className="text-xs text-destructive">{errors.trade_setup}</p>}
      </div>

      <div className="space-y-2">
        <Label>Chart screenshot</Label>
        <Card className="p-4 border-dashed">
          {form.screenshot ? (
            <div className="relative">
              <img src={form.screenshot} alt="preview" className="w-full max-h-96 object-contain rounded-md bg-muted" />
              <Button
                type="button" variant="secondary" size="icon"
                className="absolute top-2 right-2"
                onClick={() => set("screenshot", "")}
                data-testid="remove-screenshot-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-10 gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" data-testid="upload-screenshot-label">
              <Upload className="h-6 w-6" />
              <span className="text-sm">Click to upload — PNG or JPG, up to 2MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} data-testid="input-screenshot" />
            </label>
          )}
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trade_logic">Trade logic</Label>
        <Textarea
          id="trade_logic" rows={4} placeholder="What was your thesis? Entry, stop, target..."
          value={form.trade_logic}
          onChange={(e) => set("trade_logic", e.target.value)}
          data-testid="input-trade-logic"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson">Lesson learned</Label>
        <Textarea
          id="lesson" rows={3} placeholder="What worked, what didn't, what to change next time..."
          value={form.lesson_learned}
          onChange={(e) => set("lesson_learned", e.target.value)}
          data-testid="input-lesson"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
        <Input
          id="tags" placeholder="momentum, earnings, gap-up"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          data-testid="input-tags"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving} data-testid="save-journal-btn">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === "create" ? "Save Journal" : "Update Journal"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate(-1)} data-testid="cancel-journal-btn">Cancel</Button>
        {mode === "create" && <span className="text-xs text-muted-foreground ml-auto">Auto-saved as draft</span>}
      </div>
    </form>
  );
}
