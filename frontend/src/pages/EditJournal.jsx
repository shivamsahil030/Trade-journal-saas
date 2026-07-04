import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import JournalForm from "@/components/JournalForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { api, formatApiErrorDetail } from "@/services/api";

export default function EditJournal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to={`/dashboard/${id}`}><Button variant="ghost" size="sm" data-testid="back-to-details-btn"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Edit entry</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-2">Update trade.</h1>
        </div>
        <div className="mt-10">
          {loading || !journal ? (
            <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>
          ) : (
            <JournalForm mode="edit" initial={journal} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
