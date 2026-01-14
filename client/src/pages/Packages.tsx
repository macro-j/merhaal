import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function Packages() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleSelectPackage = (packageName: string) => {
    toast.success(language === 'ar' 
      ? `تم اختيار ${packageName}! سيتم التواصل معك لإتمام العملية`
      : `${packageName} selected! We will contact you to complete the process`
    );
  };

  const packages = [
    {
      id: "free",
      name: "مجاني",
      nameEn: "Free",
      price: 0,
      period: "دائماً",
      periodEn: "Forever",
      features: [
        { text: "رحلة واحدة (يوم واحد)", textEn: "One trip (one day)", included: true },
        { text: "3 أنشطة في اليوم", textEn: "3 activities per day", included: true },
        { text: "معاينة النظام", textEn: "System preview", included: true },
      ],
    },
    {
      id: "smart",
      name: "ذكي",
      nameEn: "Smart",
      price: 14.99,
      period: "دفعة واحدة",
      periodEn: "One-time",
      recommended: true,
      features: [
        { text: "رحلات حتى 10 أيام", textEn: "Trips up to 10 days", included: true },
        { text: "5 أنشطة في اليوم", textEn: "5 activities per day", included: true },
        { text: "حفظ 3 خطط رحلات", textEn: "Save 3 trip plans", included: true },
        { text: "التخطيط الذكي", textEn: "Smart planning", included: true },
        { text: "فلاتر متقدمة", textEn: "Advanced filters", included: true },
      ],
    },
    {
      id: "pro",
      name: "احترافي",
      nameEn: "Professional",
      price: 29.99,
      period: "شهرياً",
      periodEn: "Monthly",
      features: [
        { text: "رحلات حتى 14 يوماً", textEn: "Trips up to 14 days", included: true },
        { text: "أنشطة غير محدودة", textEn: "Unlimited activities", included: true },
        { text: "حفظ غير محدود", textEn: "Unlimited saves", included: true },
        { text: "حجز مباشر", textEn: "Direct booking", included: true },
        { text: "مرشدون سياحيون", textEn: "Tour guides", included: true },
        { text: "دعم أولوية", textEn: "Priority support", included: true },
      ],
    },
  ];

  const content = {
    ar: {
      title: "اختر باقتك",
      subtitle: "ابدأ مجاناً، ثم قم بالترقية حسب احتياجاتك",
      recommended: "موصى به",
      selectBtn: "اختر",
      currentPlan: "الباقة الحالية",
      currency: "ريال",
    },
    en: {
      title: "Choose Your Plan",
      subtitle: "Start free, then upgrade as you need",
      recommended: "Recommended",
      selectBtn: "Select",
      currentPlan: "Current Plan",
      currency: "SAR",
    }
  };

  const t = content[language];

  return (
    <div 
      className={`min-h-screen bg-background ${language === 'ar' ? 'rtl' : 'ltr'}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Navbar language={language} onToggleLanguage={toggleLanguage} />

      <section 
        className="pt-24 pb-16 md:pt-32 md:pb-24"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 6rem)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-3">
              {t.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex-1 relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                  pkg.recommended 
                    ? "bg-card border-2 border-accent shadow-lg ring-1 ring-accent/20" 
                    : "bg-card border border-border"
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                      {t.recommended}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? pkg.name : pkg.nameEn}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {pkg.price === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : pkg.price}
                    </span>
                    {pkg.price > 0 && (
                      <span className="text-muted-foreground text-sm">{t.currency}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? pkg.period : pkg.periodEn}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">
                        {language === 'ar' ? feature.text : feature.textEn}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPackage(language === 'ar' ? pkg.name : pkg.nameEn)}
                  disabled={pkg.price === 0}
                  className={`w-full h-12 rounded-full text-base font-medium ${
                    pkg.recommended
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : pkg.price === 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {pkg.price === 0 ? t.currentPlan : t.selectBtn}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer 
        className="bg-muted/50 py-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? '© 2025 مرحال. جميع الحقوق محفوظة.' : '© 2025 Marhal. All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
