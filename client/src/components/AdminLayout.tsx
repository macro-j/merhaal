import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Building2, Users, MapPin, LayoutDashboard, LogOut, Home, MessageSquare } from "lucide-react";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { isRTL } = useLanguage();
  
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
    { href: '/admin/users', label: 'المستخدمين', icon: Users },
    { href: '/admin/support', label: 'رسائل الدعم', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-e border-border p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-primary">لوحة الإدارة</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setLocation(item.href)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="absolute bottom-4 start-4 end-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setLocation('/')}
            >
              <Home className="w-4 h-4" />
              العودة للموقع
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
              onClick={() => {
                logout();
                setLocation('/');
              }}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
