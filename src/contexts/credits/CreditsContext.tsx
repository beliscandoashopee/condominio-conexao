
import React, { createContext, useContext } from "react";
import { CreditsContextType } from "./types";

// Create the context with an undefined initial value
const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

// Custom hook to use the credits context
export const useCredits = (): CreditsContextType => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};

// Export the context for the provider to use
export default CreditsContext;
