import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ImageOff } from "lucide-react";

function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function JournalCard({ journal, onDelete }) {
  return (
    <Card className="group overflow-hidden border-border transition-all hover:-translate-y-1 hover:shadow-lg" data-testid={`journal-card-${journal.id}`}>
      <Link to={`/dashboard/${journal.id}`} className="block">
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {journal.screenshot ? (
            <img
              src={journal.screenshot}
              alt={journal.stock_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur bg-background/80" data-testid={`journal-setup-badge-${journal.id}`}>
            {journal.trade_setup}
          </Badge>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-mono">{formatDate(journal.trade_date)}</div>
            <div className="font-display font-bold text-lg truncate mt-0.5" data-testid={`journal-stock-name-${journal.id}`}>{journal.stock_name}</div>
          </div>
        </div>
        {journal.trade_logic ? (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{journal.trade_logic}</p>
        ) : null}
        {journal.tags?.length ? (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {journal.tags.slice(0, 4).map((t, i) => (
              <span key={i} className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md border border-border text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 mt-5">
          <Link to={`/dashboard/${journal.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" data-testid={`journal-view-btn-${journal.id}`}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
          <Link to={`/dashboard/${journal.id}/edit`}>
            <Button variant="outline" size="sm" data-testid={`journal-edit-btn-${journal.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onDelete(journal)} data-testid={`journal-delete-btn-${journal.id}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
