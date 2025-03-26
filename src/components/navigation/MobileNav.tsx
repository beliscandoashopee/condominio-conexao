
import React from "react";
import { Link } from "react-router-dom";
import { Settings, Plus, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavLink } from "./NavLink";
import { RouteConfig } from "./types";

interface MobileNavProps {
  routes: RouteConfig[];
  isActive: (path: string) => boolean;
  user: any;
  profile: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const MobileNav = ({ 
  routes, 
  isActive, 
  user, 
  profile,
  isAdmin,
  handleLogout,
  open,
  setOpen
}: MobileNavProps) => {
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[80%] sm:w-[350px] border-l border-border/30 bg-white/90 backdrop-blur-lg">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              ConexãoCondomínio
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                route={route}
                isActive={isActive}
                onClick={() => setOpen(false)}
                className="px-4 py-3"
              />
            ))}
            
            {isAdmin && (
              <NavLink
                route={{
                  name: "Admin",
                  path: "/admin",
                  icon: Settings
                }}
                isActive={isActive}
                onClick={() => setOpen(false)}
                className="px-4 py-3"
              />
            )}
            
            {user ? (
              <>
                <Button asChild className="mt-4 bg-gradient-to-r from-primary to-blue-600 text-white py-6 shadow-md">
                  <Link 
                    to="/marketplace?new=true"
                    onClick={() => setOpen(false)}
                  >
                    <Plus size={18} className="mr-2" />
                    Anunciar
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Sair
                </Button>
              </>
            ) : (
              <Button asChild className="mt-4">
                <Link 
                  to="/auth"
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={18} className="mr-2" />
                  Entrar / Cadastrar
                </Link>
              </Button>
            )}
          </nav>
          {profile && (
            <div className="mt-auto pt-6 border-t border-border/30">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.apartment && profile.block ? `Apto ${profile.apartment} · Bloco ${profile.block}` : "Usuário"}
                    {isAdmin && <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">Admin</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
