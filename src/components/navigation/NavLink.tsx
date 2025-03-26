
import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const NavLink = ({ 
  to, 
  icon: Icon, 
  isActive, 
  children, 
  onClick,
  className 
}: NavLinkProps) => {
  const baseClasses = "flex items-center transition-all duration-300";
  const desktopClasses = "px-4 py-2 rounded-full";
  const mobileClasses = "px-4 py-3 rounded-lg";
  
  const activeClasses = isActive
    ? "bg-primary text-white font-medium"
    : "text-foreground/80 hover:bg-secondary hover:text-foreground";
  
  const classes = `${baseClasses} ${className?.includes("px-4 py-3") ? mobileClasses : desktopClasses} ${activeClasses} ${className || ""}`;

  return (
    <Link to={to} onClick={onClick} className={classes}>
      <Icon size={className?.includes("px-4 py-3") ? 20 : 18} className={className?.includes("px-4 py-3") ? "mr-3" : "mr-2"} />
      <span className={className?.includes("px-4 py-3") ? "text-lg" : ""}>{children}</span>
    </Link>
  );
};
