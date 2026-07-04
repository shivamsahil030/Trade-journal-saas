import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NotFound() {
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
      <div className="flex-1 grid place-items-center px-6 text-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">404 · not found</div>
          <h1 className="font-display font-extrabold text-6xl mt-3">Page missing.</h1>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            The page you&apos;re looking for was moved, renamed, or never existed.
          </p>
          <Link to="/"><Button className="mt-8" data-testid="notfound-home-btn">Back home</Button></Link>
        </div>
      </div>
    </div>
  );
}
