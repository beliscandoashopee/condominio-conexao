
import { IconType } from "lucide-react";

export interface RouteConfig {
  name: string;
  path: string;
  icon: IconType;
  requireAuth?: boolean;
}
