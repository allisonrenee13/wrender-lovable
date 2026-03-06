import { Home, Map, Clock, MapPin, Users, Settings, RefreshCw } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import figmentLogo from "@/assets/figment-logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Map", url: "/map", icon: Map },
  { title: "Locations", url: "/locations", icon: MapPin },
  { title: "Timeline", url: "/timeline", icon: Clock },
  { title: "Characters", url: "/characters", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border">
      <div className="px-5 py-5 flex items-center gap-3">
        <img src={figmentLogo} alt="Figment" className="w-8 h-8" />
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Figment</span>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "border-l-2 border-primary bg-muted text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4 space-y-3">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-2 py-1.5">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors w-full px-2 py-1.5 border border-border rounded-md">
          <RefreshCw className="h-3 w-3" />
          <span>Sync with Dabble</span>
        </button>
        <p className="text-[11px] text-muted-foreground/50 px-2 italic font-serif">See your story.</p>
      </SidebarFooter>
    </Sidebar>
  );
}
