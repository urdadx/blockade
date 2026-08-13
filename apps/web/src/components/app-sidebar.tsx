import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/sidebar";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { ChartIcon } from "@/assets/icons/chart-icon";
import { SettingsIcon } from "@/assets/icons/settings-duotone";

import { NavMain } from "./nav-main";
import { LockIcon } from "@/assets/icons/lock";
import { BrandLogo } from "./brand-logo";

const data = {
  overview: [
    {
      title: "Block List",
      url: "/block-list",
      icon: LockIcon,
    },
    {
      title: "Insights",
      url: "/insights",
      icon: ChartIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({
  footer,
  ...props
}: React.ComponentProps<typeof Sidebar> & { footer?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="p-5 flex flex-row gap-2 items-center ">
          <BrandLogo />
          <span className="text-2xl font-display font-semibold text-foreground">Blockade</span>
        </SidebarHeader>
        <SidebarContent className="p-3">
          <NavMain items={data.overview} />
        </SidebarContent>
        {footer && <SidebarFooter className="p-4">{footer}</SidebarFooter>}
      </Sidebar>
      <SidebarInset className="min-h-0 bg-[#FCFCFC] min-w-0 flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 min-w-0  overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
