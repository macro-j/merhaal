import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Building2, Users, MapPin, LayoutDashboard, LogOut, Home, MessageSquare, Hotel, FileSpreadsheet, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: adminCheck, isLoading, error } = trpc.admin.checkAccess.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (error || !adminCheck?.isAdmin)) {
      setLocation('/login');
    }
  }, [isLoading, error, adminCheck, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">جارٍ التحقق...</p>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/admin/cities', label: 'المدن', icon: Building2 },
    { href: '/admin/activities', label: 'الأماكن', icon: MapPin },
    { href: '/admin/accommodations', label: 'الإقامات', icon: Hotel },
    { href: '/admin/users', label: 'المستخدمين', icon: Users },
    { href: '/admin/support', label: 'رسائل الدعم', icon: MessageSquare },
    { href: '/admin/import', label: 'استيراد البيانات', icon: FileSpreadsheet },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    setLocation(href);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2 h-11"
            onClick={() => handleNavClick(item.href)}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Button>
        ))}
      </nav>

      <div className="pt-4 mt-auto border-t border-border space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-11"
          onClick={() => handleNavClick('/')}
        >
          <Home className="w-4 h-4 shrink-0" />
          العودة للموقع
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-11 text-red-500 hover:text-red-600"
          onClick={() => {
            logout();
            setLocation('/');
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          تسجيل الخروج
        </Button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {isMobile ? (
        <>
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">فتح القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-4 flex flex-col">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">لوحة الإدارة</h1>
          </header>
          <main className="p-4">
            {children}
          </main>
        </>
      ) : (
        <div className="flex">
          <aside className="w-64 min-h-screen bg-card border-e border-border p-4 flex flex-col sticky top-0 h-screen">
            <SidebarContent />
          </aside>

          <main className="flex-1 p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
