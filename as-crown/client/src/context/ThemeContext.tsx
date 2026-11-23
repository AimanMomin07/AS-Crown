import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const lightToDark: Record<string, string> = {
  "white": "#111827",
  "#ffffff": "#111827",
  "#fff": "#111827",
  "#f8fafc": "#0f172a",
  "#f5f7fb": "#0f172a",
  "#f1f5f9": "#1e293b",
  "#e2e8f0": "#334155",
  "#fef2f2": "#3f1d24",
  "#ecfdf5": "#13352a",
  "#eff6ff": "#172554",
  "#fff7ed": "#3a2b16",
  "#0f172a": "#f8fafc",
  "#334155": "#cbd5e1",
  "#475569": "#cbd5e1",
  "#64748b": "#94a3b8"
};

const normalize = (value: string) => value.trim().toLowerCase();

function transformInlineStyles(root: HTMLElement, dark: boolean) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of elements) {
    if (el.dataset.asThemeSkip === "1") continue;

    const bg = el.style.backgroundColor;
    const color = el.style.color;
    const border = el.style.borderColor;

    if (dark) {
      if (bg && !el.dataset.asOriginalBg) el.dataset.asOriginalBg = bg;
      if (color && !el.dataset.asOriginalColor) el.dataset.asOriginalColor = color;
      if (border && !el.dataset.asOriginalBorder) el.dataset.asOriginalBorder = border;

      const mappedBg = bg ? lightToDark[normalize(bg)] : undefined;
      const mappedColor = color ? lightToDark[normalize(color)] : undefined;
      const mappedBorder = border ? lightToDark[normalize(border)] : undefined;

      if (mappedBg) el.style.setProperty("background-color", mappedBg, "important");
      if (mappedColor) el.style.setProperty("color", mappedColor, "important");
      if (mappedBorder) el.style.setProperty("border-color", mappedBorder, "important");
    } else {
      if (el.dataset.asOriginalBg) { el.style.setProperty("background-color", el.dataset.asOriginalBg); delete el.dataset.asOriginalBg; }
      if (el.dataset.asOriginalColor) { el.style.setProperty("color", el.dataset.asOriginalColor); delete el.dataset.asOriginalColor; }
      if (el.dataset.asOriginalBorder) { el.style.setProperty("border-color", el.dataset.asOriginalBorder); delete el.dataset.asOriginalBorder; }
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("as-crown-theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("as-crown-theme", theme);
    document.body.classList.toggle("as-crown-dark", theme === "dark");
    transformInlineStyles(document.body, theme === "dark");

    const observer = new MutationObserver((records) => {
      let shouldTransform = false;
      for (const record of records) {
        if (record.type === "childList" || record.type === "attributes") { shouldTransform = true; break; }
      }
      if (shouldTransform) transformInlineStyles(document.body, theme === "dark");
    });

    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme(current => current === "light" ? "dark" : "light") }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
