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
  Megaphone,
  UserPlus,
  Filter,
  CalendarClock,
  Image,
  Users2,
  Building2,
  Webhook,
  FileText,
  KanbanSquare,
  MessageSquareText,
  ChevronDown,
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
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
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

function NavSection({ id, label, collapsed, children }) {
  const storageKey = `navSection:${id}`;
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === null ? true : stored === "true";
  });

  const toggle = (e) => {
    // não deixa o clique do cabeçalho fechar o drawer mobile
    e.stopPropagation();
    setOpen((prev) => {
      localStorage.setItem(storageKey, String(!prev));
      return !prev;
    });
  };

  if (collapsed) {
    return (
      <>
        <div className="my-2 h-px bg-border" />
        {children}
      </>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors hover:text-foreground"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !open && "-rotate-90"
          )}
        />
      </button>
      <div
        className={cn(
          "mt-1 flex flex-col gap-1 overflow-hidden transition-all",
          !open && "hidden"
        )}
      >
        {children}
      </div>
    </div>
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
    <nav className="flex flex-col gap-1 px-2 pb-6" onClick={drawerClose}>
      {/* Nível principal */}
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

      {/* Atendimento */}
      <NavSection id="atendimento" label="Atendimento" collapsed={collapsed}>
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
        <NavItem
          to="/message-templates"
          icon={FileText}
          label="Modelos de mensagem"
          collapsed={collapsed}
        />
        <NavItem
          to="/scheduled-messages"
          icon={CalendarClock}
          label="Mensagens agendadas"
          collapsed={collapsed}
        />
        <NavItem
          to="/media-library"
          icon={Image}
          label="Biblioteca de mídias"
          collapsed={collapsed}
        />
      </NavSection>

      {/* CRM & Vendas */}
      <NavSection id="crm" label="CRM & Vendas" collapsed={collapsed}>
        <NavItem
          to="/crm/leads"
          icon={UserPlus}
          label="Leads"
          collapsed={collapsed}
        />
        <NavItem
          to="/crm/funnel"
          icon={Filter}
          label="Funil de vendas"
          collapsed={collapsed}
        />
        <NavItem
          to="/campaigns"
          icon={Megaphone}
          label="Campanhas"
          collapsed={collapsed}
        />
      </NavSection>

      {/* Equipe / colaboração interna */}
      <NavSection id="equipe" label="Colaboração" collapsed={collapsed}>
        <NavItem
          to="/boards"
          icon={KanbanSquare}
          label="Quadros"
          collapsed={collapsed}
        />
        <NavItem
          to="/internal-chat"
          icon={MessageSquareText}
          label="Chat interno"
          collapsed={collapsed}
        />
      </NavSection>

      {/* Administração (somente admin) */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <NavSection
            id="administracao"
            label={i18n.t("mainDrawer.listItems.administration")}
            collapsed={collapsed}
          >
            <NavItem
              to="/users"
              icon={Users}
              label={i18n.t("mainDrawer.listItems.users")}
              collapsed={collapsed}
            />
            <NavItem
              to="/teams"
              icon={Users2}
              label="Equipes"
              collapsed={collapsed}
            />
            <NavItem
              to="/departments"
              icon={Building2}
              label="Departamentos"
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
              to="/webhooks"
              icon={Webhook}
              label="Webhooks"
              collapsed={collapsed}
            />
            <NavItem
              to="/Settings"
              icon={Settings}
              label={i18n.t("mainDrawer.listItems.settings")}
              collapsed={collapsed}
            />
          </NavSection>
        )}
      />
    </nav>
  );
};

export default MainListItems;
