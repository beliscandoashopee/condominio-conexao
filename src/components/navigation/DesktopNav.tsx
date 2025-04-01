import React from "react";
import { Link } from "react-router-dom";
import { Plus, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import { RouteConfig } from "./types";

interface DesktopNavProps {
  routes: RouteConfig[];
  isActive: (path: string) => boolean;
  user: any;
  isAdmin: boolean;
  handleLogout: () => Promise<void>;
}

export const DesktopNav = ({ 
  routes, 
  isActive, 
  user, 
  isAdmin,
  handleLogout 
}: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {routes.map((route) => (
        <NavLink
          key={route.path}
          route={route}
          isActive={isActive}
          onClick={() => {}}
        />
      ))}
      
      {user ? (
        <>
          <Button asChild className="ml-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
            <Link to="/marketplace?new=true">
              <Plus size={18} className="mr-2" />
              Anunciar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="ml-2 rounded-full"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </>
      ) : (
        <Button asChild className="ml-2 rounded-full">
          <Link to="/auth">
            <LogIn size={18} className="mr-2" />
            Entrar
          </Link>
        </Button>
      )}
    </nav>
  );
};
