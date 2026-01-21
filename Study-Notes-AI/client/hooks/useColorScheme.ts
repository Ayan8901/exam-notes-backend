import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export function useColorScheme(): "light" | "dark" {
  const { effectiveTheme } = useContext(ThemeContext);
  return effectiveTheme;
}
