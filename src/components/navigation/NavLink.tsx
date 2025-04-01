
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { RouteConfig } from "./types";

interface NavLinkProps {
  route?: RouteConfig;
  href?: string; 
  onClick?: () => void;
  isActive: boolean | ((path: string) => boolean);
  className?: string;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({
  route,
  href,
  onClick,
  isActive,
  className,
  iconOnly = false,
  children,
}) => {
  // Use path from route or href prop
  const path = route?.path || href || "";
  
  // Check if isActive is a function or boolean
  const isActiveValue = typeof isActive === 'function' ? isActive(path) : isActive;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
        isActiveValue && "bg-accent/60 text-accent-foreground font-medium",
        className
      )}
    >
      {route?.icon && <route.icon className={cn("h-5 w-5", !iconOnly && "mr-2")} />}
      {!iconOnly && children ? children : !iconOnly && route?.name}
    </Link>
  );
};

export default NavLink;
