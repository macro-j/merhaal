import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function TopHeader() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, isRTL } = useLanguage();

  return (
    <div
      className="flex items-center justify-between h-14 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo on the left */}
      <div className="flex items-center">
        <img
          src="/logo.jpg"
          alt="Merhaal"
          className="h-8 w-auto"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = '/logo.svg';
          }}
        />
      </div>

      {/* Controls on the right */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-xs md:text-sm px-2 md:px-3"
        >
          {language === "ar" ? "EN" : "العربية"}
        </Button>
      </div>
    </div>
  );
}
