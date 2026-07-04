import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import JournalForm from "@/components/JournalForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function CreateJournal() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/dashboard"><Button variant="ghost" size="sm" data-testid="back-to-dashboard-btn"><ChevronLeft className="h-4 w-4 mr-1" /> Dashboard</Button></Link>
        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">New entry</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-2">Log a trade.</h1>
          <p className="text-muted-foreground mt-2 text-sm">Capture the setup, the logic, and the lesson while it&apos;s fresh.</p>
        </div>
        <div className="mt-10">
          <JournalForm mode="create" />
        </div>
      </div>
    </DashboardLayout>
  );
}
