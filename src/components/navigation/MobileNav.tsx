
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import NavLink from './NavLink';
import { RouteConfig } from './types';

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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
          <line x1="4" x2="20" y1="12" y2="12"></line>
          <line x1="4" x2="20" y1="6" y2="6"></line>
          <line x1="4" x2="20" y1="18" y2="18"></line>
        </svg>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-3/4 max-w-xs bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-8">
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X size={24} />
                </Button>
              </div>

              <nav className="flex flex-col items-start space-y-4">
                {routes.map((route) => (
                  <NavLink
                    key={route.path}
                    href={route.path}
                    isActive={isActive(route.path)}
                    onClick={() => setOpen(false)}
                  >
                    {route.icon && <route.icon size={18} className="mr-2" />}
                    {route.name}
                  </NavLink>
                ))}

                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sair
                  </Button>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
