import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/DashboardLayout";
import JournalCard from "@/components/JournalCard";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/services/api";
import { Plus, Search, NotebookText } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/journals");

setJournals(
  Array.isArray(data)
    ? data
    : Array.isArray(data?.journals)
      ? data.journals
      : []
);}
//       const { data } = await api.get("/journals");
//       setJournals(data.journals);
//  } 
 catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return journals || [];
    // if (!q) return journals;
    // return journals.filter((j) =>
      return (journals || []).filter((j) =>
      j.stock_name.toLowerCase().includes(q) ||
      j.trade_setup.toLowerCase().includes(q) ||
      j.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [journals, query]);

  const confirmDelete = async () => {
    if (!pending) return;
    try {
      await api.delete(`/journals/${pending.id}`);
      setJournals((arr) => arr.filter((j) => j.id !== pending.id));
      toast.success("Journal deleted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setPending(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Welcome back</div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-2" data-testid="dashboard-heading">
              {user?.name ? `Hi, ${user.name}.` : "Your journal."}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">You have {journals.length} journal{journals.length === 1 ? "" : "s"}.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stock, setup, or tag"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-72"
                data-testid="search-input"
              />
            </div>
            <Link to="/dashboard/new">
              <Button data-testid="new-journal-btn"><Plus className="h-4 w-4 mr-1" /> New Journal</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="dashboard-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl py-20 text-center" data-testid="dashboard-empty-state">
              <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center mx-auto">
                <NotebookText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="font-display font-bold text-xl mt-6">No trade journals yet.</div>
              <div className="text-muted-foreground text-sm mt-2">Create your first journal.</div>
              <Link to="/dashboard/new">
                <Button className="mt-6" data-testid="empty-new-journal-btn"><Plus className="h-4 w-4 mr-1" /> New Journal</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="journal-grid">
              {filtered.map((j) => (
                <JournalCard key={j.id} journal={j} onDelete={(x) => setPending(x)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this journal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium text-foreground">{pending?.stock_name}</span> and its screenshot. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="delete-confirm-btn">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
