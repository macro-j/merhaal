import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CityDetailModal } from "@/components/CityDetailModal";
import { Calendar, Settings, Sparkles, Globe, Users, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function Home() {
  let { isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

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
      icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'محرك توليد ذكي',
      titleEn: 'Smart Generation Engine',
      description: 'توليد جداول رحلات مخصصة بناءً على تفضيلاتك',
      descriptionEn: 'Generate custom trip schedules based on your preferences'
    },
    {
      icon: <Settings className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'التخصيص الكامل',
      titleEn: 'Full Customization',
      description: 'اختر الوجهات والميزانية والاهتمامات المناسبة لك',
      descriptionEn: 'Choose destinations, budget and interests that suit you'
    },
    {
      icon: <Calendar className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'حجز فوري',
      titleEn: 'Instant Booking',
      description: 'احجز الأنشطة والفنادق مباشرة من التطبيق',
      descriptionEn: 'Book activities and hotels directly through the app'
    },
    {
      icon: <Globe className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'دعم متعدد اللغات',
      titleEn: 'Multi-language Support',
      description: 'متاح بالعربية والإنجليزية لراحتك',
      descriptionEn: 'Available in Arabic and English for your convenience'
    },
    {
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'مرشدون معتمدون',
      titleEn: 'Certified Guides',
      description: 'احجز مرشدين سياحيين محترفين لمرافقتك',
      descriptionEn: 'Book professional tour guides to accompany you'
    },
    {
      icon: <Share2 className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'مشاركة وتصدير',
      titleEn: 'Share & Export',
      description: 'شارك خططك أو صدرها كملف PDF',
      descriptionEn: 'Share your plans or export them as PDF'
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
      className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`} 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Navbar language={language} onToggleLanguage={toggleLanguage} />

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

      <section id="destinations" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-primary">
              {t.destinationsTitle}
            </h2>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-400">
              {t.destinationsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {destinations.map((dest, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[3/4] relative">
                  <img 
                    src={dest.image} 
                    alt={language === 'ar' ? dest.name : dest.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 text-white">
                    <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                      {language === 'ar' ? dest.name : dest.nameEn}
                    </h3>
                    <p className="text-xs md:text-base text-gray-200 mb-2 md:mb-4 line-clamp-2">
                      {language === 'ar' ? dest.subtitle : dest.subtitleEn}
                    </p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full text-xs md:text-sm h-8 md:h-9 px-3 md:px-4"
                      onClick={() => setSelectedCity(dest.id)}
                    >
                      {t.explore}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-12 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-primary">
            {t.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-5 md:p-8 rounded-xl md:rounded-2xl bg-secondary/30 dark:bg-secondary/10 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 md:mb-6 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">
                  {language === 'ar' ? feature.title : feature.titleEn}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
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
        className="bg-gray-900 dark:bg-black text-white py-6 md:py-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm md:text-base text-gray-400">{t.footer}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-gray-400 hover:text-white"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
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
