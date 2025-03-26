
import { LucideIcon } from "lucide-react";

export interface RouteConfig {
  name: string;
  path: string;
  icon: LucideIcon;
  requireAuth?: boolean;
}
