
import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { themes, ThemeId } from "../app/(tabs)/theme";

type ThemeContextType = {
  activeThemeId: ThemeId;
  setActiveThemeId: (id: ThemeId) => void;
  isUnlocked: (id: ThemeId) => boolean;
  colors: (typeof themes)[ThemeId];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeThemeId, setActiveThemeIdState] = useState<ThemeId>("dark");

  const isUnlocked = (id: ThemeId) => {
    if (id === "dark") return true; // tema default selalu gratis
    return user?.unlocked_themes?.includes(id) ?? false;
  };

  const setActiveThemeId = (id: ThemeId) => {
    if (!isUnlocked(id)) return; // jaga-jaga: gak bisa pindah ke tema yang belum dibeli
    setActiveThemeIdState(id);
  };

  return (
    <ThemeContext.Provider
      value={{ activeThemeId, setActiveThemeId, isUnlocked, colors: themes[activeThemeId] }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam <ThemeProvider>");
  return ctx;
}