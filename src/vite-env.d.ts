/// <reference types="vite/client" />

declare module "@/lib/supabase" {
  export const supabase: any;
}

declare module "@/integrations/supabase/types" {
  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            role: string;
            [key: string]: any;
          };
        };
      };
    };
  }
}
