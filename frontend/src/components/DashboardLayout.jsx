import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { LineChart, Home, Plus, User, LogOut } from "lucide-react";

function SidebarLink({ to, icon: Icon, children, testId }) {
  return (
    <NavLink
      to={to}
      end
      data-testid={testId}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <LineChart className="h-4 w-4" />
          </div>
          <span className="font-display font-bold tracking-tight">Trade Journal</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarLink to="/dashboard" icon={Home} testId="sidebar-dashboard-link">Dashboard</SidebarLink>
          <SidebarLink to="/dashboard/new" icon={Plus} testId="sidebar-new-journal-link">New Journal</SidebarLink>
          <SidebarLink to="/profile" icon={User} testId="sidebar-profile-link">Profile</SidebarLink>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || "Trader"}</div>
              <div className="text-xs text-muted-foreground truncate font-mono">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 glass sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <LineChart className="h-3.5 w-3.5" />
              </div>
              <span className="font-display font-bold text-sm">Trade Journal</span>
            </Link>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Workspace
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/new" className="hidden sm:block">
              <Button size="sm" data-testid="topbar-new-journal-btn"><Plus className="h-4 w-4 mr-1" /> New Journal</Button>
            </Link>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="profile-menu-btn">
                  <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" data-testid="profile-menu-content">
                <DropdownMenuLabel>
                  <div className="font-medium">{user?.name || "Trader"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={doLogout} data-testid="menu-logout">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
