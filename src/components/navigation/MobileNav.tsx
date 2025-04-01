import React from 'react';
import { X, LogOut, Menu, Plus, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import NavLink from './NavLink';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RouteConfig } from './types';
import { Link } from 'react-router-dom';

export interface MobileNavProps {
  routes: RouteConfig[];
  isActive: (path: string) => boolean;
  user: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  routes,
  isActive,
  user,
  isAdmin,
  handleLogout,
  open,
  setOpen
}) => {
  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[80%] sm:max-w-sm p-0">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-end mb-8">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X size={24} />
              </Button>
            </div>

            <nav className="flex flex-col items-start space-y-4">
              {routes.map((route) => (
                <NavLink
                  key={route.path}
                  route={route}
                  isActive={isActive(route.path)}
                  onClick={() => setOpen(false)}
                />
              ))}

              {user ? (
                <>
                  <Button asChild className="w-full justify-start">
                    <Link to="/marketplace/new" onClick={() => setOpen(false)}>
                      <Plus size={18} className="mr-2" />
                      Anunciar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
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
                <Button asChild className="w-full justify-start">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <LogIn size={18} className="mr-2" />
                    Entrar
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
