import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  CheckSquare,
  Settings,
  Users,
  Menu,
  PanelLeft,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useFullApp } from "@/store/hooks/useFullApp";

/**
 * Sidebar items — each entry provides TWO icons:
 *  - `icon`: default (inactive) icon
 *  - `activeIcon`: shown when the route matches `pathName`
 */
const sidebarItems = [
  {
    title: "Home",
    icon: <Home className="h-5 w-5" />,
    activeIcon: <Home className="h-5 w-5 fill-current" />,
    pathName: "/",
    items: [],
  },
  {
    title: "Tasks",
    icon: <CheckSquare className="h-5 w-5" />,
    activeIcon: <CheckSquare className="h-5 w-5 fill-current" />,
    pathName: "/tasks",
    badge: "3",
    items: [],
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    activeIcon: <Settings className="h-5 w-5 fill-current" />,
    pathName: "/settings",
    items: [],
  },
  {
    title: "Members",
    icon: <Users className="h-5 w-5" />,
    activeIcon: <Users className="h-5 w-5 fill-current" />,
    pathName: "/members",
    items: [],
  },
];

function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const { user } = useFullApp();
  const { pathname } = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (!user) return <Navigate to={"/"} />;

  /**
   * Renders the icon for a nav item.
   * Switches to `activeIcon` when the current path matches.
   */
  const renderIcon = (
    item: (typeof sidebarItems)[number],
    isActive: boolean
  ) => (
    <div
      className={cn(
        "p-2 rounded-lg transition-colors",
        isActive
          ? "bg-white/20"
          : "bg-slate-200 dark:bg-slate-700 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30"
      )}
    >
      {isActive ? item.activeIcon ?? item.icon : item.icon}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full">
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 bg-gradient-radial"></div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 md:hidden shadow-2xl transition-transform duration-300 ease-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <Link to={"/"}>
              <h2 className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
                DevTrail
              </h2>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.pathName === pathname;
                return (
                  <div key={item.title}>
                    <Link
                      to={item.pathName || ""}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (item.items) toggleExpanded(item.title);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {renderIcon(item, isActive)}
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className="ml-auto rounded-full px-2 py-0.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl md:block shadow-xl transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <Link to={"/"}>
              <h2 className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
                DevTrail
              </h2>
            </Link>
          </div>

          <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.pathName === pathname;
                return (
                  <div key={item.title}>
                    <Link
                      to={item.pathName as any}
                      onClick={() => {
                        if (item.items) toggleExpanded(item.title);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:translate-x-1"
                      )}
                    >
                      {renderIcon(item, isActive)}
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className="ml-auto rounded-full px-2 py-0.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* User Profile Card */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-yellow-500 shadow-md">
                <AvatarImage src={""} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-yellow-600 to-yellow-600 text-white font-semibold">
                  {user.user_name ? user.user_name[0] : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.user_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={cn(
          "min-h-screen w-full relative transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:pl-72" : "md:pl-0"
        )}
      >
        <header className="fixed w-full top-0 z-10 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <Avatar className="h-9 w-9 border-2 border-yellow-500 shadow-md cursor-pointer hover:scale-110 transition-transform">
              <AvatarImage src={""} alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-yellow-600 to-yellow-600 text-white font-semibold">
                {user.user_name ? user.user_name[0] : "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 mt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppSidebar;
