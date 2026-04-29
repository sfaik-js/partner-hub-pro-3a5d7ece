import { LayoutDashboard, Users, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Partenaires", url: "/partenaires", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r shadow-sm">
      <SidebarContent>
        <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border/50 transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight flex flex-col justify-center animate-in fade-in duration-300">
              <div className="text-base font-bold text-sidebar-foreground tracking-tight">PartnerHub</div>
              <div className="text-[11px] font-medium text-sidebar-foreground/60 uppercase tracking-widest mt-0.5">Workspace</div>
            </div>
          )}
        </div>

        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {items.map((item) => {
                const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active} 
                      className={cn(
                        "h-11 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/50",
                        active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-sidebar-foreground/60")} />
                        {!collapsed && <span className="animate-in fade-in duration-300">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}