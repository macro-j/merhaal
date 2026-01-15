import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Packages() {
  const { language, isRTL } = useLanguage();

  const handleSelectPackage = (packageName: string) => {
    toast.success(language === 'ar' 
      ? `تم اختيار ${packageName}! سيتم التواصل معك لإتمام العملية`
      : `${packageName} selected! We will contact you to complete the process`
    );
  };

  const packages = [
    {
      id: "basic",
      name: "أساسي",
      nameEn: "Basic",
      title: "ابدأ رحلتك بسهولة",
      titleEn: "Start your journey easily",
      description: "مناسب لمن يريد خطة سريعة وواضحة دون تعقيد.",
      descriptionEn: "Perfect for those who want a quick and clear plan without complexity.",
      price: "مجانية",
      priceEn: "Free",
      priceSecondary: null,
      priceSecondaryEn: null,
      cta: "ابدأ الآن",
      ctaEn: "Start Now",
      features: [
        { text: "إنشاء خطة رحلة واحدة", textEn: "Create one trip plan" },
        { text: "اقتراحات لأشهر الأماكن والمطاعم", textEn: "Suggestions for popular places and restaurants" },
        { text: "مدة رحلة قصيرة", textEn: "Short trip duration" },
        { text: "تجربة بسيطة وسريعة", textEn: "Simple and fast experience" },
      ],
    },
    {
      id: "advanced",
      name: "متقدم",
      nameEn: "Advanced",
      title: "خطط رحلتك بطريقتك",
      titleEn: "Plan your trip your way",
      description: "تحكم أكبر وتخصيص أوسع لرحلتك.",
      descriptionEn: "More control and wider customization for your trip.",
      price: "14.99 ريال / خطة",
      priceEn: "SAR 14.99 / plan",
      priceSecondary: null,
      priceSecondaryEn: null,
      cta: "ترقية",
      ctaEn: "Upgrade",
      features: [
        { text: "إنشاء عدة خطط", textEn: "Create multiple plans" },
        { text: "تخصيص حسب الميزانية ونوع الرحلة", textEn: "Customize by budget and trip type" },
        { text: "حفظ الخطط والعودة لها لاحقًا", textEn: "Save plans and return to them later" },
        { text: "إعادة توليد الخطة عند الحاجة", textEn: "Regenerate the plan when needed" },
      ],
    },
    {
      id: "premium",
      name: "بريميوم",
      nameEn: "Premium",
      title: "التجربة الكاملة لرحلة مثالية",
      titleEn: "The complete experience for a perfect trip",
      description: "أقصى درجات التخصيص والراحة.",
      descriptionEn: "Maximum customization and comfort.",
      price: "29.99 ريال شهريًا",
      priceEn: "SAR 29.99 / month",
      priceSecondary: "أو 249 ريال سنويًا",
      priceSecondaryEn: "or SAR 249 / year",
      cta: "ترقية إلى بريميوم",
      ctaEn: "Upgrade to Premium",
      features: [
        { text: "تخصيص ذكي متقدم حسب الوقت والاهتمامات", textEn: "Advanced smart customization by time and interests" },
        { text: "اقتراحات أماكن فريدة وغير تقليدية", textEn: "Unique and unconventional place suggestions" },
        { text: "حفظ غير محدود للخطط", textEn: "Unlimited plan saves" },
        { text: "أولوية الوصول للمميزات الجديدة والمدن القادمة", textEn: "Priority access to new features and upcoming cities" },
      ],
    },
  ];

  const content = {
    ar: {
      title: "الباقات",
      subtitle: "اختر الباقة المناسبة لاحتياجاتك",
    },
    en: {
      title: "Plans",
      subtitle: "Choose the plan that fits your needs",
    }
  };

  const t = content[language];

  return (
    <div 
      className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Navbar />

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

          <div className="flex flex-col md:flex-row gap-5 md:gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex-1 bg-card border border-border/60 rounded-2xl p-6 md:p-8 flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {language === 'ar' ? pkg.name : pkg.nameEn}
                  </h3>
                  <div className="mb-3">
                    <p className="text-xl font-semibold text-foreground">
                      {language === 'ar' ? pkg.price : pkg.priceEn}
                    </p>
                    {pkg.priceSecondary && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {language === 'ar' ? pkg.priceSecondary : pkg.priceSecondaryEn}
                      </p>
                    )}
                  </div>
                  <p className="text-base font-medium text-primary mb-2">
                    {language === 'ar' ? pkg.title : pkg.titleEn}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'ar' ? pkg.description : pkg.descriptionEn}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">
                        {language === 'ar' ? feature.text : feature.textEn}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPackage(language === 'ar' ? pkg.name : pkg.nameEn)}
                  className="w-full h-12 rounded-full text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {language === 'ar' ? pkg.cta : pkg.ctaEn}
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
            {language === 'ar' ? '© 2026 مرحال. جميع الحقوق محفوظة.' : '© 2026 Merhaal. All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
