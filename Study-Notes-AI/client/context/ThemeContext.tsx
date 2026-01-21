import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  effectiveTheme: "light",
  setThemeMode: () => {},
  isDarkMode: false,
});

const THEME_STORAGE_KEY = "@exam_notes_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeModeState(stored);
      }
    } catch (e) {
      console.error("Failed to load theme:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  const effectiveTheme: "light" | "dark" =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const isDarkMode = effectiveTheme === "dark";

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ themeMode, effectiveTheme, setThemeMode, isDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
