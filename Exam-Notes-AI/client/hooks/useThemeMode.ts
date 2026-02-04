import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export function useThemeMode() {
  const { themeMode, setThemeMode, isDarkMode } = useContext(ThemeContext);
  return { themeMode, setThemeMode, isDarkMode };
}
