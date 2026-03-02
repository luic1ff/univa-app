import type { UserSettings } from "@/entities/user/model/settings/types";

export function applyDomSettings(settings: UserSettings) {
    const root = document.documentElement;

    // theme: керуємо класом .dark і color-scheme
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const effectiveTheme =
        settings.theme === "system" ? (prefersDark ? "dark" : "light") : settings.theme;

    if (effectiveTheme === "dark") {
        root.classList.add("dark");
        // optional: root.style.colorScheme = "dark";
    } else {
        root.classList.remove("dark");
        // optional: root.style.colorScheme = "light";
    }

    // compact / animations: через data-атрибути
    root.dataset.compact = settings.compact ? "1" : "0";
    root.dataset.animations = settings.animations ? "1" : "0";

    // language: html[lang]
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    root.lang = settings.language === "auto" ? browserLang : settings.language;
}