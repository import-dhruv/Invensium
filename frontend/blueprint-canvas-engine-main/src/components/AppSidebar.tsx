import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ClipboardCheck, History, Settings, User, Boxes
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
];

const opsNav = [
  { title: "Receipts", url: "/operations/receipts", icon: ArrowDownToLine },
  { title: "Deliveries", url: "/operations/deliveries", icon: ArrowUpFromLine },
  { title: "Transfers", url: "/operations/transfers", icon: ArrowLeftRight },
  { title: "Adjustments", url: "/operations/adjustments", icon: ClipboardCheck },
];

const otherNav = [
  { title: "Move History", url: "/moves", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const renderItems = (items: typeof mainNav) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="!bg-primary/10 !text-primary border border-primary/20"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.svg" alt="CoreInventory" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              Core<span className="text-primary">Inventory</span>
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(opsNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(otherNav)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")}>
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="!bg-primary/10 !text-primary"
              >
                <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                {!collapsed && <span className="text-sm font-medium">{user?.name || "Profile"}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

