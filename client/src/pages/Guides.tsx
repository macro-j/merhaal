import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Star, Search, Lock, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const tourGuides = [
  {
    id: 1,
    name: "أحمد المالكي",
    nameEn: "Ahmed Al-Malki",
    city: "الرياض",
    cityEn: "Riyadh",
    rating: 4.9,
  },
  {
    id: 2,
    name: "فاطمة العتيبي",
    nameEn: "Fatima Al-Otaibi",
    city: "أبها",
    cityEn: "Abha",
    rating: 4.8,
  },
  {
    id: 3,
    name: "سعيد القحطاني",
    nameEn: "Saeed Al-Qahtani",
    city: "جدة",
    cityEn: "Jeddah",
    rating: 5.0,
  },
  {
    id: 4,
    name: "نورة الشمري",
    nameEn: "Noura Al-Shammari",
    city: "المدينة",
    cityEn: "Madinah",
    rating: 4.9,
  },
  {
    id: 5,
    name: "خالد الدوسري",
    nameEn: "Khalid Al-Dosari",
    city: "العلا",
    cityEn: "AlUla",
    rating: 4.7,
  },
  {
    id: 6,
    name: "مريم الغامدي",
    nameEn: "Maryam Al-Ghamdi",
    city: "ينبع",
    cityEn: "Yanbu",
    rating: 4.8,
  },
];

type ModalType = "login" | "upgrade" | null;

export default function Guides() {
  const { language, isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);

  const isPro = isAuthenticated && user?.tier === "professional";

  const content = {
    ar: {
      heroTitle: "المرشدون",
      heroSubtitle: "خبراء محليون لتجربة أفضل",
      searchPlaceholder: "ابحث باسم المرشد...",
      viewProfile: "عرض الملف",
      proBadge: "Pro",
      footer: "© 2026 مرحال. جميع الحقوق محفوظة.",
      loginModal: {
        title: "تسجيل الدخول مطلوب",
        subtitle: "سجّل دخولك لعرض المرشدين",
        primaryBtn: "تسجيل الدخول",
        secondaryBtn: "إلغاء",
      },
      upgradeModal: {
        title: "ميزة احترافية",
        subtitle: "المرشدون متاحون لمشتركي Pro",
        primaryBtn: "عرض الباقات",
        secondaryBtn: "لاحقاً",
      },
    },
    en: {
      heroTitle: "Guides",
      heroSubtitle: "Certified guides for your journey",
      searchPlaceholder: "Search by name...",
      viewProfile: "View Profile",
      proBadge: "Pro",
      footer: "© 2026 Merhaal. All rights reserved.",
      loginModal: {
        title: "Sign In Required",
        subtitle: "Sign in to view guides",
        primaryBtn: "Sign In",
        secondaryBtn: "Cancel",
      },
      upgradeModal: {
        title: "Pro Feature",
        subtitle: "Guides are available for Pro members",
        primaryBtn: "View Plans",
        secondaryBtn: "Later",
      },
    },
  };

  const t = content[language];

  const handleViewProfile = () => {
    if (!isAuthenticated) {
      setModalType("login");
      return;
    }
    if (!isPro) {
      setModalType("upgrade");
      return;
    }
    // Pro user - allow access (for now just close)
    setModalType(null);
  };

  const handleModalPrimary = () => {
    if (modalType === "login") {
      setLocation("/login");
    } else if (modalType === "upgrade") {
      setLocation("/packages");
    }
    setModalType(null);
  };

  const handleModalClose = () => {
    setModalType(null);
  };

  const modalContent = modalType === "login" ? t.loginModal : t.upgradeModal;

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Navbar />

      <section
        className="pt-24 pb-10 md:pt-32 md:pb-14 bg-gradient-to-b from-primary/5 to-transparent"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 6rem)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-3">
            {t.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 ps-12 pe-4 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {tourGuides.map((guide) => (
              <div
                key={guide.id}
                className="relative bg-card rounded-2xl border border-border p-5 flex flex-col items-center text-center transition-shadow hover:shadow-md"
              >
                {!isPro && (
                  <div className="absolute top-3 end-3 flex items-center gap-1 bg-muted/80 text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span>{t.proBadge}</span>
                  </div>
                )}

                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-semibold text-primary">
                    {guide.name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-base font-medium text-foreground mb-1">
                  {language === "ar" ? guide.name : guide.nameEn}
                </h3>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{language === "ar" ? guide.city : guide.cityEn}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-5">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span>{guide.rating}</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full text-sm font-medium"
                  onClick={handleViewProfile}
                >
                  {t.viewProfile}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="bg-secondary/50 py-10 mt-auto"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/70">{t.footer}</p>
        </div>
      </footer>

      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={handleModalClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {modalContent.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {modalContent.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full h-12 rounded-full"
                onClick={handleModalPrimary}
              >
                {modalContent.primaryBtn}
              </Button>
              <Button
                variant="ghost"
                className="w-full h-12 rounded-full"
                onClick={handleModalClose}
              >
                {modalContent.secondaryBtn}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
