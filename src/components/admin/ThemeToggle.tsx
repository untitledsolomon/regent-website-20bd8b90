import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors group"
      aria-label="Toggle theme"
    >
      <Sun size={16} className="absolute text-muted-foreground group-hover:text-foreground transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon size={16} className="absolute text-muted-foreground group-hover:text-foreground transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
