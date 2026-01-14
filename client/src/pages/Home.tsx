import { useAuth } from "@/hooks/useAuth";
import { useInView } from "@/hooks/useInView";
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
  
  const { ref: destinationsRef, isInView: destinationsInView } = useInView();
  const { ref: featuresRef, isInView: featuresInView } = useInView();

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
        title: 'رحلتك تبدأ من هنا',
        subtitle: 'خطط. اكتشف. انطلق.',
        cta: 'ابدأ الآن'
      },
      destinationsTitle: 'اختر وجهتك',
      destinationsSubtitle: 'مدن تستحق الزيارة',
      explore: 'اكتشف',
      featuresTitle: 'مميزات مرحال',
      ctaSection: {
        title: 'جاهز للانطلاق؟',
        subtitle: 'ابدأ التخطيط الآن',
        button: 'ابدأ مجاناً'
      },
      footer: '© 2026 مرحال. جميع الحقوق محفوظة.'
    },
    en: {
      hero: {
        title: 'Discover Saudi Arabia',
        subtitle: 'Trips made for you. Plan smart.',
        cta: 'Start Planning'
      },
      destinationsTitle: 'Top Destinations',
      destinationsSubtitle: 'Beautiful cities await you',
      explore: 'Explore',
      featuresTitle: 'Why Merhaal?',
      ctaSection: {
        title: 'Ready to Go?',
        subtitle: 'Start your next trip now',
        button: 'Start Free'
      },
      footer: '© 2026 Merhaal. All rights reserved.'
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

      <section 
        id="destinations" 
        className="py-16 md:py-24 bg-secondary/30"
        ref={destinationsRef as React.RefObject<HTMLElement>}
      >
        <div className={`container mx-auto transition-all duration-700 ease-out ${destinationsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                className="group relative flex-shrink-0 w-[280px] md:w-auto snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl card-hover"
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

      <section 
        id="features" 
        className="py-20 md:py-28 bg-background"
        ref={featuresRef as React.RefObject<HTMLElement>}
      >
        <div className={`container mx-auto px-4 transition-all duration-700 ease-out ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              {language === 'ar' ? 'كل ما تحتاجه في مكان واحد' : 'Smart tools for your perfect trip'}
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

      <footer 
        className="bg-secondary/50 dark:bg-muted/30 py-8 md:py-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
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
