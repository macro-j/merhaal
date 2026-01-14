import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CityDetailModal } from "@/components/CityDetailModal";
import { Calendar, Settings, Sparkles, Globe, Users, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  let { isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const destinations = [
    {
      id: 'الرياض',
      name: 'الرياض',
      nameEn: 'Riyadh',
      subtitle: 'قلب المملكة النابض',
      subtitleEn: 'The Beating Heart of the Kingdom',
      description: 'عاصمة تجمع بين التراث والحداثة مع أسواق عريقة ومتاحف وواجهات حديثة',
      descriptionEn: 'A capital that combines heritage and modernity with traditional markets, museums and modern facades',
      image: '/cities/riyadh.jpg'
    },
    {
      id: 'جدة',
      name: 'جدة',
      nameEn: 'Jeddah',
      subtitle: 'عروس البحر الأحمر',
      subtitleEn: 'Bride of the Red Sea',
      description: 'مدينة ساحلية بموروث عريق مع كورنيش ساحر وتراث إسلامي',
      descriptionEn: 'A coastal city with rich heritage, charming corniche and Islamic heritage',
      image: '/cities/jeddah.jpg'
    },
    {
      id: 'العلا',
      name: 'العلا',
      nameEn: 'AlUla',
      subtitle: 'متحف حي في الصحراء',
      subtitleEn: 'A Living Museum in the Desert',
      description: 'موقع يونسكو مع طبيعة خلابة وآثار عريقة ومناظر صحراوية ساحرة',
      descriptionEn: 'UNESCO site with stunning nature, ancient ruins and charming desert landscapes',
      image: '/cities/alula.jpg'
    },
    {
      id: 'أبها',
      name: 'أبها',
      nameEn: 'Abha',
      subtitle: 'عروس الجنوب',
      subtitleEn: 'Bride of the South',
      description: 'جبال خضراء وطبيعة ساحرة في منطقة عسير',
      descriptionEn: 'Green mountains and charming nature in Asir region',
      image: '/cities/abha.jpg'
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'تخطيط ذكي',
      titleEn: 'Smart Planning',
      description: 'جداول رحلات مخصصة لتفضيلاتك',
      descriptionEn: 'Custom trip schedules for your preferences'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: 'تخصيص كامل',
      titleEn: 'Full Control',
      description: 'اختر الوجهات والميزانية والاهتمامات',
      descriptionEn: 'Choose destinations, budget and interests'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'حجز مباشر',
      titleEn: 'Direct Booking',
      description: 'احجز الأنشطة والفنادق بسهولة',
      descriptionEn: 'Book activities and hotels easily'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'دعم اللغات',
      titleEn: 'Multi-language',
      description: 'متاح بالعربية والإنجليزية',
      descriptionEn: 'Available in Arabic and English'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'مرشدون محترفون',
      titleEn: 'Pro Guides',
      description: 'مرشدون سياحيون معتمدون',
      descriptionEn: 'Certified tour guides'
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'مشاركة سهلة',
      titleEn: 'Easy Sharing',
      description: 'شارك خططك أو صدرها PDF',
      descriptionEn: 'Share plans or export as PDF'
    }
  ];

  const content = {
    ar: {
      hero: {
        title: 'رحلتك تبدأ هنا',
        subtitle: 'خطط رحلتك داخل السعودية بذكاء',
        cta: 'ابدأ الآن'
      },
      destinationsTitle: 'اختر وجهتك',
      destinationsSubtitle: 'اكتشف أجمل المدن السعودية',
      explore: 'استكشف',
      featuresTitle: 'مميزات مرحال',
      ctaSection: {
        title: 'جاهز لبدء رحلتك؟',
        subtitle: 'ابدأ التخطيط لرحلتك القادمة الآن',
        button: 'ابدأ مجاناً'
      },
      footer: '© 2025 مرحال. جميع الحقوق محفوظة.'
    },
    en: {
      hero: {
        title: 'Your Journey Starts Here',
        subtitle: 'Plan your trip in Saudi Arabia smartly',
        cta: 'Start Now'
      },
      destinationsTitle: 'Choose Your Destination',
      destinationsSubtitle: 'Discover the most beautiful Saudi cities',
      explore: 'Explore',
      featuresTitle: 'Marhal Features',
      ctaSection: {
        title: 'Ready to Start?',
        subtitle: 'Start planning your next trip now',
        button: 'Start Free'
      },
      footer: '© 2025 Marhal. All rights reserved.'
    }
  };

  const t = content[language];

  return (
    <div 
      className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Navbar />

      <section 
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ 
          minHeight: "100svh",
          paddingTop: "calc(env(safe-area-inset-top) + 56px)",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center justify-center flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
            {t.hero.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-md md:max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = isAuthenticated ? '/plan-trip' : '/login'}
            className="bg-white text-primary hover:bg-white/90 text-base md:text-lg px-8 py-6 h-14 md:h-16 rounded-full shadow-xl font-semibold min-w-[160px]"
          >
            {t.hero.cta}
          </Button>
        </div>
      </section>

      <section id="destinations" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 md:mb-14 px-4">
            <h2 className="text-2xl md:text-4xl font-semibold mb-2 md:mb-3 text-foreground">
              {t.destinationsTitle}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.destinationsSubtitle}
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-4 hide-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-4">
            {destinations.map((dest, index) => (
              <button 
                key={index}
                onClick={() => setSelectedCity(dest.id)}
                className="group relative flex-shrink-0 w-[280px] md:w-auto snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
              >
                <div className="aspect-[4/5] relative overflow-hidden rounded-2xl">
                  <img 
                    src={dest.image} 
                    alt={language === 'ar' ? dest.name : dest.nameEn}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white text-start">
                    <h3 className="text-xl md:text-2xl font-semibold mb-1">
                      {language === 'ar' ? dest.name : dest.nameEn}
                    </h3>
                    <p className="text-sm text-white/80 mb-4 leading-relaxed">
                      {language === 'ar' ? dest.subtitle : dest.subtitleEn}
                    </p>
                    <span className="inline-flex items-center justify-center h-11 px-6 bg-white/95 text-primary font-medium text-sm rounded-full shadow-sm group-hover:bg-white transition-colors">
                      {t.explore}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              {language === 'ar' ? 'كل ما تحتاجه لتخطيط رحلتك المثالية' : 'Everything you need to plan your perfect trip'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 md:p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {language === 'ar' ? feature.title : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'ar' ? feature.description : feature.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent/80"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            {t.ctaSection.title}
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8">
            {t.ctaSection.subtitle}
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = isAuthenticated ? '/plan-trip' : '/login'}
            className="bg-white text-primary hover:bg-white/90 text-base md:text-lg px-8 py-6 h-14 md:h-16 rounded-full shadow-xl font-semibold"
          >
            {t.ctaSection.button}
          </Button>
        </div>
      </section>

      <footer 
        className="bg-secondary/50 dark:bg-muted/30 py-12 md:py-16"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3rem)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 md:gap-10">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-semibold text-primary mb-1">
                {language === 'ar' ? 'مرحال' : 'Marhal'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'خطط رحلتك بذكاء' : 'Plan your trip smartly'}
              </p>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {language === 'ar' ? 'من نحن' : 'About'}
              </a>
              <a href="/packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {language === 'ar' ? 'الباقات' : 'Packages'}
              </a>
              <a href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {language === 'ar' ? 'الدعم' : 'Support'}
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>

            <p className="text-xs text-muted-foreground/70">
              {t.footer}
            </p>
          </div>
        </div>
      </footer>

      <CityDetailModal
        cityId={selectedCity}
        isOpen={!!selectedCity}
        onClose={() => setSelectedCity(null)}
        language={language}
      />
    </div>
  );
}
