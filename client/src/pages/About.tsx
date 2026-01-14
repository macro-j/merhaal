import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Map, Heart } from "lucide-react";

export default function About() {
  const { language, isRTL } = useLanguage();

  const content = {
    ar: {
      heroTitle: "من نحن",
      heroSubtitle: "نساعدك تكتشف السعودية بطريقتك",
      ideaTitle: "فكرتنا",
      ideaText: "بدأ مرحال من فكرة بسيطة: تخطيط الرحلات لازم يكون سهل وممتع. نجمع لك كل اللي تحتاجه في مكان واحد — وجهات، أنشطة، وجداول مخصصة لك.",
      howTitle: "كيف يعمل مرحال",
      steps: [
        { num: "١", title: "اختر وجهتك", desc: "تصفح المدن واختر المكان اللي يناسبك" },
        { num: "٢", title: "خصص رحلتك", desc: "حدد الميزانية والاهتمامات والمدة" },
        { num: "٣", title: "استلم جدولك", desc: "احصل على خطة رحلة جاهزة ومفصلة" },
      ],
      whyTitle: "ليش مرحال؟",
      values: [
        { icon: Sparkles, title: "ذكي", desc: "تخطيط مبني على تفضيلاتك الشخصية" },
        { icon: Map, title: "شامل", desc: "كل الوجهات والأنشطة في مكان واحد" },
        { icon: Heart, title: "سهل", desc: "واجهة بسيطة وتجربة سلسة" },
      ],
      footer: "© 2025 مرحال. جميع الحقوق محفوظة.",
    },
    en: {
      heroTitle: "About Us",
      heroSubtitle: "Helping you discover Saudi Arabia your way",
      ideaTitle: "Our Idea",
      ideaText: "Merhaal started from a simple idea: trip planning should be easy and enjoyable. We bring everything you need in one place — destinations, activities, and personalized schedules.",
      howTitle: "How Merhaal Works",
      steps: [
        { num: "1", title: "Choose your destination", desc: "Browse cities and pick what suits you" },
        { num: "2", title: "Customize your trip", desc: "Set budget, interests, and duration" },
        { num: "3", title: "Get your schedule", desc: "Receive a ready, detailed trip plan" },
      ],
      whyTitle: "Why Merhaal?",
      values: [
        { icon: Sparkles, title: "Smart", desc: "Planning based on your personal preferences" },
        { icon: Map, title: "Comprehensive", desc: "All destinations and activities in one place" },
        { icon: Heart, title: "Simple", desc: "Clean interface and smooth experience" },
      ],
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
        className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-primary/5 to-transparent"
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

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
              {t.ideaTitle}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t.ideaText}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center mb-10">
            {t.howTitle}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-3xl mx-auto">
            {t.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex-1 bg-card rounded-2xl p-6 border border-border"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-primary">{step.num}</span>
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center mb-10">
            {t.whyTitle}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-3xl mx-auto">
            {t.values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="flex-1 text-center p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer
        className="bg-secondary/50 py-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/70">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
