
export type ThemeId = "dark" | "ceria";

export const themes: Record<ThemeId, {
  label: string;
  price: string | null; // null = gratis
  BG: string;
  SURFACE: string;
  SANGRIA: string;
  SANGRIA_DEEP: string;
  CORNFLOWER: string;
  INK: string;
  INK_SOFT: string;
  LINE: string;
}> = {
  dark: {
    label: "Tema Gelap",
    price: null,
    BG: "#141014",
    SURFACE: "#1F181A",
    SANGRIA: "#C23B32",
    SANGRIA_DEEP: "#8A1F18",
    CORNFLOWER: "#95BBEA",
    INK: "#F3E9E6",
    INK_SOFT: "#9C8B8A",
    LINE: "#302426",
  },
  ceria: {
    label: "Tema Ceria",
    price: "Rp 19.000",
    BG: "#FFF8E7",
    SURFACE: "#FFFFFF",
    SANGRIA: "#930500",
    SANGRIA_DEEP: "#6E0400",
    CORNFLOWER: "#5C8FCB",
    INK: "#3A1210",
    INK_SOFT: "#5B6B7C",
    LINE: "#F0E4C8",
  },
};


export const BG = themes.dark.BG;
export const SURFACE = themes.dark.SURFACE;
export const SANGRIA = themes.dark.SANGRIA;
export const SANGRIA_DEEP = themes.dark.SANGRIA_DEEP;
export const CORNFLOWER = themes.dark.CORNFLOWER;
export const INK = themes.dark.INK;
export const INK_SOFT = themes.dark.INK_SOFT;
export const LINE = themes.dark.LINE;