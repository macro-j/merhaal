import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CityDetailModal } from "@/components/CityDetailModal";
import { Moon, Sun, Calendar, Settings, Sparkles, Globe, Users, Share2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

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
      icon: <Sparkles className="w-8 h-8" />,
      title: 'محرك توليد ذكي',
      titleEn: 'Smart Generation Engine',
      description: 'توليد جداول رحلات مخصصة بناءً على تفضيلاتك باستخدام خوارزميات ذكية',
      descriptionEn: 'Generate custom trip schedules based on your preferences using smart algorithms'
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'التخصيص الكامل',
      titleEn: 'Full Customization',
      description: 'اختر الوجهات والميزانية والاهتمامات ونوع الإقامة المناسبة لك',
      descriptionEn: 'Choose destinations, budget, interests and accommodation type that suits you'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'حجز فوري',
      titleEn: 'Instant Booking',
      description: 'احجز الأنشطة والفنادق مباشرة من خلال التطبيق',
      descriptionEn: 'Book activities and hotels directly through the app'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'دعم متعدد اللغات',
      titleEn: 'Multi-language Support',
      description: 'متاح باللغتين العربية والإنجليزية لراحتك',
      descriptionEn: 'Available in Arabic and English for your convenience'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'مرشدون معتمدون',
      titleEn: 'Certified Guides',
      description: 'احجز مرشدين سياحيين محترفين ومعتمدين لمرافقتك',
      descriptionEn: 'Book professional and certified tour guides to accompany you'
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'مشاركة وتصدير',
      titleEn: 'Share & Export',
      description: 'شارك خططك مع الأصدقاء أو صدرها كملف PDF',
      descriptionEn: 'Share your plans with friends or export them as PDF'
    }
  ];

  const content = {
    ar: {
      home: 'الرئيسية',
      features: 'المميزات',
      destinations: 'الوجهات',
      packages: 'الباقات',
      about: 'من نحن',
      guides: 'مرشدون محليون',
      support: 'الدعم',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      hero: {
        title: 'مرحال - رحلتك تبدأ بخطوة ذكية',
        subtitle: 'خطط رحلتك داخل السعودية بذكاء - جداول شخصية، حجوزات فورية، مرشدون معتمدون',
        cta: 'ابدأ التخطيط الآن'
      },
      destinationsTitle: 'مرحال - اختر وجهتك',
      destinationsSubtitle: 'اكتشف أجمل المدن السعودية',
      explore: 'استكشف',
      featuresTitle: 'مميزات مرحال',
      ctaSection: {
        title: 'جاهز لبدء رحلتك؟',
        subtitle: 'ابدأ التخطيط لرحلتك القادمة الآن مع مرحال',
        button: 'ابدأ الآن مجاناً'
      },
      footer: '© 2025 مرحال. جميع الحقوق محفوظة.'
    },
    en: {
      home: 'Home',
      features: 'Features',
      destinations: 'Destinations',
      packages: 'Packages',
      about: 'About Us',
      guides: 'Local Guides',
      support: 'Support',
      login: 'Login',
      signup: 'Sign Up',
      hero: {
        title: 'Marhal - Your Journey Starts with a Smart Step',
        subtitle: 'Plan your trip in Saudi Arabia smartly - personalized schedules, instant bookings, certified guides',
        cta: 'Start Planning Now'
      },
      destinationsTitle: 'Marhal - Choose Your Destination',
      destinationsSubtitle: 'Discover the most beautiful Saudi cities',
      explore: 'Explore',
      featuresTitle: 'Marhal Features',
      ctaSection: {
        title: 'Ready to Start Your Journey?',
        subtitle: 'Start planning your next trip now with Marhal',
        button: 'Start Now for Free'
      },
      footer: '© 2025 Marhal. All rights reserved.'
    }
  };

  const t = content[language];

  return (
    <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-yellow-600 bg-clip-text text-transparent">
                مرحال
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.home}</a>
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.features}</a>
              <a href="#destinations" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.destinations}</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" onClick={(e) => { e.preventDefault(); /* Packages page coming soon */ }}>{t.packages}</a>
              <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.about}</a>
              <a href="/guides" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.guides}</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" onClick={(e) => { e.preventDefault(); /* Support page coming soon */ }}>{t.support}</a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </Button>

              {isAuthenticated ? (
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700"
                >
                  لوحة التحكم
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    {t.login}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => window.location.href = '/register'}
                    className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700"
                  >
                    {t.signup}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-yellow-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = isAuthenticated ? '/plan-trip' : '/login'}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-2xl"
          >
            {t.hero.cta}
          </Button>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-700 to-yellow-600 bg-clip-text text-transparent">
              {t.destinationsTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t.destinationsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={dest.image} 
                    alt={language === 'ar' ? dest.name : dest.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ar' ? dest.name : dest.nameEn}
                    </h3>
                    <p className="text-lg mb-2 text-gray-200">
                      {language === 'ar' ? dest.subtitle : dest.subtitleEn}
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      {language === 'ar' ? dest.description : dest.descriptionEn}
                    </p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full"
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-700 to-yellow-600 bg-clip-text text-transparent">
            {t.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-700 to-yellow-600 flex items-center justify-center text-white mb-6 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {language === 'ar' ? feature.title : feature.titleEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? feature.description : feature.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-green-600 to-yellow-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.ctaSection.title}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t.ctaSection.subtitle}
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = isAuthenticated ? '/plan-trip' : '/login'}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-2xl"
          >
            {t.ctaSection.button}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">{t.footer}</p>
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

      {/* City Detail Modal */}
      <CityDetailModal
        cityId={selectedCity}
        isOpen={!!selectedCity}
        onClose={() => setSelectedCity(null)}
        language={language}
      />
    </div>
  );
}
