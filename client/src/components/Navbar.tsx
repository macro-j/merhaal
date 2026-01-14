import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
}

interface NavLink {
  href: string;
  labelAr: string;
  labelEn: string;
}

const navLinks: NavLink[] = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/packages", labelAr: "الباقات", labelEn: "Packages" },
  { href: "/guides", labelAr: "المرشدون", labelEn: "Guides" },
  { href: "/about", labelAr: "من نحن", labelEn: "About" },
  { href: "/support", labelAr: "الدعم", labelEn: "Support" },
];

export function Navbar({ language, onToggleLanguage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    window.location.href = href;
  };

  return (
    <nav 
      className="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <a 
            href="/" 
            className="text-xl md:text-2xl font-bold text-primary"
          >
            مرحال
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                )}
              >
                {language === "ar" ? link.labelAr : link.labelEn}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleLanguage}
                className="text-sm"
              >
                {language === "ar" ? "English" : "العربية"}
              </Button>

              {isAuthenticated ? (
                <Button
                  size="sm"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  {language === "ar" ? "لوحة التحكم" : "Dashboard"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/login")}
                  >
                    {language === "ar" ? "دخول" : "Login"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = "/register")}
                  >
                    {language === "ar" ? "حساب جديد" : "Sign Up"}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="w-11 h-11 rounded-full md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side={language === "ar" ? "right" : "left"} 
          className="w-[85vw] max-w-sm p-0"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <SheetHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <SheetTitle className="text-xl font-bold text-primary text-start">
              مرحال
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "w-full px-4 py-3.5 rounded-xl text-base font-medium text-start transition-colors min-h-[44px]",
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {language === "ar" ? link.labelAr : link.labelEn}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-4 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleLanguage}
                className="flex-1 h-11"
              >
                {language === "ar" ? "English" : "العربية"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="w-11 h-11"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            </div>

            {isAuthenticated ? (
              <Button
                className="w-full h-12"
                onClick={() => handleNavClick("/dashboard")}
              >
                {language === "ar" ? "لوحة التحكم" : "Dashboard"}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full h-12"
                  onClick={() => handleNavClick("/register")}
                >
                  {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => handleNavClick("/login")}
                >
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
