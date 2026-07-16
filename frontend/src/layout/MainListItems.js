import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Repeat,
  MessageCircle,
  Contact,
  Network,
  MessagesSquare,
  Users,
  Settings,
  Tag,
} from "lucide-react";

import { cn } from "../lib/utils";
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

function NavItem({ to, icon: Icon, label, badge, onClick, collapsed }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground"
        )
      }
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon className="h-[18px] w-[18px]" />
        {badge && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            !
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

const MainListItems = ({ drawerClose, collapsed }) => {
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        setConnectionWarning(offlineWhats.length > 0);
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <nav className="flex flex-col gap-1 px-2" onClick={drawerClose}>
      <NavItem
        to="/"
        icon={LayoutDashboard}
        label="Dashboard"
        collapsed={collapsed}
      />
      <NavItem
        to="/connections"
        icon={Repeat}
        label={i18n.t("mainDrawer.listItems.connections")}
        badge={connectionWarning}
        collapsed={collapsed}
      />
      <NavItem
        to="/tickets"
        icon={MessageCircle}
        label={i18n.t("mainDrawer.listItems.tickets")}
        collapsed={collapsed}
      />
      <NavItem
        to="/contacts"
        icon={Contact}
        label={i18n.t("mainDrawer.listItems.contacts")}
        collapsed={collapsed}
      />
      <NavItem
        to="/quickAnswers"
        icon={MessagesSquare}
        label={i18n.t("mainDrawer.listItems.quickAnswers")}
        collapsed={collapsed}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <div className="mt-4 mb-1 px-3">
              {!collapsed && (
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {i18n.t("mainDrawer.listItems.administration")}
                </span>
              )}
              {collapsed && <div className="h-px bg-border" />}
            </div>
            <NavItem
              to="/users"
              icon={Users}
              label={i18n.t("mainDrawer.listItems.users")}
              collapsed={collapsed}
            />
            <NavItem
              to="/Queues"
              icon={Network}
              label={i18n.t("mainDrawer.listItems.queues")}
              collapsed={collapsed}
            />
            <NavItem
              to="/tags"
              icon={Tag}
              label={i18n.t("mainDrawer.listItems.tags")}
              collapsed={collapsed}
            />
            <NavItem
              to="/Settings"
              icon={Settings}
              label={i18n.t("mainDrawer.listItems.settings")}
              collapsed={collapsed}
            />
          </>
        )}
      />
    </nav>
  );
};

export default MainListItems;
