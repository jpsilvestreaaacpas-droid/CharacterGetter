import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-lg hover:bg-gold-500/10 hover:text-gold-500 transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-gold-400" />
      ) : (
        <Moon className="h-4 w-4 text-gold-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
