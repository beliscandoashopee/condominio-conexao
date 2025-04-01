import React from "react";
import { Link } from "react-router-dom";
import { Plus, LogOut, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLink } from "./NavLink";
import { RouteConfig } from "./types";

interface MobileNavProps {
  routes: RouteConfig[];
  isActive: (path: string) => boolean;
  user: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
}

export const MobileNav = ({
  routes,
  isActive,
  user,
  isAdmin,
  handleLogout,
}: MobileNavProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              route={route}
              isActive={isActive}
              onClick={() => setOpen(false)}
            />
          ))}

          {user ? (
            <>
              <Button asChild className="w-full rounded-full bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
                <Link to="/marketplace?new=true" onClick={() => setOpen(false)}>
                  <Plus size={18} className="mr-2" />
                  Anunciar
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={async () => {
                  await handleLogout();
                  setOpen(false);
                }}
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild className="w-full rounded-full">
              <Link to="/auth" onClick={() => setOpen(false)}>
                <LogIn size={18} className="mr-2" />
                Entrar
              </Link>
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
