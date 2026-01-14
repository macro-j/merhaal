import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Star, Search } from "lucide-react";
import { useState } from "react";

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

export default function Guides() {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const content = {
    ar: {
      heroTitle: "المرشدون",
      heroSubtitle: "مرشدون محترفون يرافقونك في رحلتك",
      searchPlaceholder: "ابحث عن مرشد...",
      viewProfile: "عرض الملف",
      footer: "© 2025 مرحال. جميع الحقوق محفوظة.",
    },
    en: {
      heroTitle: "Guides",
      heroSubtitle: "Professional guides to accompany your journey",
      searchPlaceholder: "Search for a guide...",
      viewProfile: "View Profile",
      footer: "© 2025 Merhaal. All rights reserved.",
    },
  };

  const t = content[language];

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
                className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center text-center transition-shadow hover:shadow-md"
              >
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
    </div>
  );
}
