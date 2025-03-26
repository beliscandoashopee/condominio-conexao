
import React from "react";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
      <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
        ConexãoCondomínio
      </span>
    </Link>
  );
};
