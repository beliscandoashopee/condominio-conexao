
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { RouteConfig } from "./types";

interface NavLinkProps {
  route: RouteConfig;
  onClick?: () => void;
  isActive: boolean | ((path: string) => boolean);
  className?: string;
  iconOnly?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  route,
  onClick,
  isActive,
  className,
  iconOnly = false,
}) => {
  // Check if route is defined before trying to access its properties
  if (!route) {
    console.error("NavLink: route prop is undefined");
    return null;
  }

  const isActiveValue = typeof isActive === 'function' ? isActive(route.path) : isActive;

  return (
    <Link
      to={route.path}
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
        isActiveValue && "bg-accent/60 text-accent-foreground font-medium",
        className
      )}
    >
      {route.icon && <route.icon className={cn("h-5 w-5", !iconOnly && "mr-2")} />}
      {!iconOnly && <span>{route.name}</span>}
    </Link>
  );
};

export default NavLink;
