import { Link } from "react-router-dom";
import { LineChart } from "lucide-react";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2" data-testid="footer-brand">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <LineChart className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Trade Journal</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            The trader&apos;s journal that grows with your edge. Log setups, screenshots, and lessons — securely and privately.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Product</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-foreground text-muted-foreground">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground text-muted-foreground">Pricing</a></li>
            <li><a href="#faq" className="hover:text-foreground text-muted-foreground">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/signup" className="hover:text-foreground text-muted-foreground">Sign up</Link></li>
            <li><Link to="/login" className="hover:text-foreground text-muted-foreground">Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Trade Journal. All rights reserved.</span>
          <span className="font-mono">v1.0</span>
        </div>
      </div>
    </footer>
  );
}
