import { Injectable, signal, effect } from "@angular/core";

export type AppTheme = "dark" | "light";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly themeKey = "portfoliopro_theme";
  currentTheme = signal<AppTheme>("dark");

  constructor() {
    const saved = (localStorage.getItem(this.themeKey) as AppTheme) || "dark";
    this.currentTheme.set(saved);
    this.applyTheme(saved);

    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  toggleTheme(): void {
    const next: AppTheme = this.currentTheme() === "dark" ? "light" : "dark";
    this.currentTheme.set(next);
    localStorage.setItem(this.themeKey, next);
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.themeKey, theme);
  }

  private applyTheme(theme: AppTheme): void {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute("data-bs-theme", theme);
    root.setAttribute("data-theme", theme);

    if (theme === "light") {
      body.classList.remove("bg-dark", "text-light");
      body.classList.add("bg-light", "text-dark", "theme-light");
      body.classList.remove("theme-dark");
    } else {
      body.classList.remove("bg-light", "text-dark", "theme-light");
      body.classList.add("bg-dark", "text-light", "theme-dark");
    }
  }
}
