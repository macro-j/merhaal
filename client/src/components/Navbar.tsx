import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  labelAr: string;
  labelEn: string;
}

const publicNavLinks: NavLink[] = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/packages", labelAr: "الباقات", labelEn: "Plans" },
  { href: "/guides", labelAr: "المرشدون", labelEn: "Guides" },
  { href: "/about", labelAr: "عن مرحال", labelEn: "About" },
  { href: "/support", labelAr: "الدعم", labelEn: "Help" },
];

const authNavLinks: NavLink[] = [
  { href: "/plan-trip", labelAr: "خطط رحلة", labelEn: "Plan Trip" },
  { href: "/my-plans", labelAr: "خططي", labelEn: "My Plans" },
  { href: "/support", labelAr: "الدعم", labelEn: "Support" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

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
      className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <a 
            href="/" 
            className="flex items-center"
          >
            <img 
              src="/logo.jpg" 
              alt="مرحال" 
              className="h-8 md:h-9 w-auto"
            />
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
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
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
                onClick={toggleLanguage}
                className="text-sm"
              >
                {language === "ar" ? "English" : "العربية"}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = "/admin")}
                    >
                      {language === "ar" ? "الإدارة" : "Admin"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    {language === "ar" ? "الحساب" : "My Account"}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => (window.location.href = "/login")}
                >
                  {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Button>
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
          <SheetHeader className="p-6 pb-4 border-b border-border">
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
                    : "text-foreground hover:bg-muted"
                )}
              >
                {language === "ar" ? link.labelAr : link.labelEn}
              </button>
            ))}
          </div>

          <div className="border-t border-border p-4 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
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
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => handleNavClick("/admin")}
                  >
                    {language === "ar" ? "الإدارة" : "Admin"}
                  </Button>
                )}
                <Button
                  className="w-full h-12"
                  onClick={() => handleNavClick("/dashboard")}
                >
                  {language === "ar" ? "الحساب" : "My Account"}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full h-12"
                onClick={() => handleNavClick("/login")}
              >
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
