import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { LineChart } from "lucide-react";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo-link">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <LineChart className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Trade Journal</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors" data-testid="nav-features">Features</a>
          <a href="#benefits" className="hover:text-foreground transition-colors" data-testid="nav-benefits">Benefits</a>
          <a href="#pricing" className="hover:text-foreground transition-colors" data-testid="nav-pricing">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors" data-testid="nav-faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login"><Button variant="ghost" size="sm" data-testid="nav-login-btn">Login</Button></Link>
          <Link to="/signup"><Button size="sm" data-testid="nav-get-started-btn">Get Started</Button></Link>
        </div>
      </div>
    </header>
  );
}
