import { LucideIcon } from "lucide-react";

export interface RouteConfig {
  name: string;
  path: string;
  icon: LucideIcon;
  isAdmin?: boolean;
  isAuth?: boolean;
}

export interface NavLinkProps {
  route: RouteConfig;
  isActive: (path: string) => boolean;
  onClick?: () => void;
}
