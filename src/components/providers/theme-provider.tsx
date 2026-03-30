"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface ColorPreset {
  name: string;
  label: string;
  dot: string; // Tailwind bg class for the color dot
  colors: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
}

export const colorPresets: ColorPreset[] = [
  { name: "blue", label: "Blue", dot: "bg-blue-500", colors: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" } },
  { name: "purple", label: "Purple", dot: "bg-purple-500", colors: { 50: "#faf5ff", 100: "#f3e8ff", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce" } },
  { name: "green", label: "Green", dot: "bg-green-500", colors: { 50: "#f0fdf4", 100: "#dcfce7", 500: "#22c55e", 600: "#16a34a", 700: "#15803d" } },
  { name: "teal", label: "Teal", dot: "bg-teal-500", colors: { 50: "#f0fdfa", 100: "#ccfbf1", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e" } },
  { name: "orange", label: "Orange", dot: "bg-orange-500", colors: { 50: "#fff7ed", 100: "#ffedd5", 500: "#f97316", 600: "#ea580c", 700: "#c2410c" } },
  { name: "rose", label: "Rose", dot: "bg-rose-500", colors: { 50: "#fff1f2", 100: "#ffe4e6", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c" } },
  { name: "indigo", label: "Indigo", dot: "bg-indigo-500", colors: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" } },
];

interface ThemeContextValue {
  preset: string;
  setPreset: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preset: "blue",
  setPreset: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyPreset(name: string) {
  const preset = colorPresets.find((p) => p.name === name) || colorPresets[0];
  const root = document.documentElement;
  root.style.setProperty("--accent-50", preset.colors[50]);
  root.style.setProperty("--accent-100", preset.colors[100]);
  root.style.setProperty("--accent-500", preset.colors[500]);
  root.style.setProperty("--accent-600", preset.colors[600]);
  root.style.setProperty("--accent-700", preset.colors[700]);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState("blue");

  useEffect(() => {
    const saved = localStorage.getItem("theme-accent");
    if (saved && colorPresets.some((p) => p.name === saved)) {
      setPresetState(saved);
      applyPreset(saved);
    } else {
      applyPreset("blue");
    }
  }, []);

  function setPreset(name: string) {
    setPresetState(name);
    localStorage.setItem("theme-accent", name);
    applyPreset(name);
  }

  return (
    <ThemeContext.Provider value={{ preset, setPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}
