import React, { useState, useContext, useEffect } from "react";
import { Menu, ChevronLeft, Moon, Sun, MessageSquare, UserCircle } from "lucide-react";

import { Button } from "../components/ui/button";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { Switch } from "../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import { useThemeContext } from "../context/DarkMode";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_WIDTH_COLLAPSED = 72;

function SidebarContent({ collapsed, drawerClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="truncate text-base font-semibold tracking-tight">
            WhaTicket
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <MainListItems drawerClose={drawerClose} collapsed={collapsed} />
      </div>
    </div>
  );
}

const LoggedInLayout = ({ children }) => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useThemeContext();

  useEffect(() => {
    const checkSize = () => {
      const mobile = document.body.offsetWidth < 600;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(true);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const drawerClose = () => {
    if (isMobile) setMobileOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
  };

  const handleClickLogout = () => {
    handleLogout();
  };

  if (loading) {
    return <BackdropLoading />;
  }

  const sidebarWidth = drawerOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r bg-card transition-[width] duration-200 ease-in-out md:block"
        )}
        style={{ width: sidebarWidth }}
      >
        <SidebarContent collapsed={!drawerOpen} drawerClose={drawerClose} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent collapsed={false} drawerClose={drawerClose} />
        </SheetContent>
      </Sheet>

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                !drawerOpen && "rotate-180"
              )}
            />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch checked={darkMode} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>

          {user.id && <NotificationsPopOver />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-auto">
          {children ? children : null}
        </main>
      </div>
    </div>
  );
};

export default LoggedInLayout;
