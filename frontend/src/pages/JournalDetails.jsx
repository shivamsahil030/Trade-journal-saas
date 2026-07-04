import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Pencil, Trash2, ImageOff } from "lucide-react";
import { api, formatApiErrorDetail } from "@/services/api";

function fmt(iso, withTime = false) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  } catch { return iso; }
}

export default function JournalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/journals/${id}`);
        setJournal(data.journal);
      } catch (err) {
        toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const doDelete = async () => {
    try {
      await api.delete(`/journals/${id}`);
      toast.success("Journal deleted");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
      setConfirming(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link to="/dashboard"><Button variant="ghost" size="sm" data-testid="details-back-btn"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
          {journal && (
            <div className="flex items-center gap-2">
              <Link to={`/dashboard/${id}/edit`}>
                <Button variant="outline" size="sm" data-testid="details-edit-btn"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setConfirming(true)} data-testid="details-delete-btn">
                <Trash2 className="h-4 w-4 mr-1 text-destructive" /> Delete
              </Button>
            </div>
          )}
        </div>

        {loading || !journal ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" data-testid="details-setup-badge">{journal.trade_setup}</Badge>
              <span className="text-sm text-muted-foreground font-mono">{fmt(journal.trade_date)}</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl mt-4 tracking-tight" data-testid="details-stock-name">
              {journal.stock_name}
            </h1>

            <Card className="mt-8 overflow-hidden border-border">
              {journal.screenshot ? (
                <img src={journal.screenshot} alt={journal.stock_name} className="w-full max-h-[600px] object-contain bg-muted" data-testid="details-screenshot" />
              ) : (
                <div className="aspect-[16/9] grid place-items-center text-muted-foreground bg-muted">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
            </Card>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <section>
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Trade logic</div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap" data-testid="details-trade-logic">
                  {journal.trade_logic || <span className="text-muted-foreground italic">No trade logic recorded.</span>}
                </p>
              </section>
              <section>
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Lesson learned</div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap" data-testid="details-lesson">
                  {journal.lesson_learned || <span className="text-muted-foreground italic">No lesson recorded.</span>}
                </p>
              </section>
            </div>

            {journal.tags?.length ? (
              <section className="mt-10">
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Tags</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {journal.tags.map((t, i) => (
                    <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-md border border-border">#{t}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground font-mono flex flex-wrap gap-x-6 gap-y-1">
              <span>Created {fmt(journal.created_at, true)}</span>
              <span>Updated {fmt(journal.updated_at, true)}</span>
            </div>
          </article>
        )}
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent data-testid="details-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this journal?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="details-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} data-testid="details-delete-confirm">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
