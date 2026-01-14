import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

type FormData = {
  name: string;
  email: string;
  requestType: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  requestType?: string;
  message?: string;
};

export default function Support() {
  const { language, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    requestType: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const content = {
    ar: {
      heroTitle: "الدعم",
      heroSubtitle: "نحن هنا للمساعدة",
      nameLabel: "الاسم",
      namePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      requestTypeLabel: "نوع الطلب",
      requestTypePlaceholder: "اختر نوع الطلب",
      requestTypes: [
        { value: "inquiry", label: "استفسار عام" },
        { value: "technical", label: "مشكلة تقنية" },
        { value: "feature", label: "اقتراح" },
        { value: "partnership", label: "شراكة" },
      ],
      messageLabel: "رسالتك",
      messagePlaceholder: "اكتب رسالتك هنا...",
      submitBtn: "إرسال",
      loadingBtn: "جارٍ الإرسال...",
      successTitle: "تم الإرسال",
      successMessage: "وصلتنا رسالتك. نرد خلال ٢٤ ساعة.",
      sendAnother: "رسالة جديدة",
      errors: {
        nameRequired: "أدخل اسمك",
        emailRequired: "أدخل بريدك الإلكتروني",
        emailInvalid: "بريد إلكتروني غير صالح",
        requestTypeRequired: "اختر نوع الطلب",
        messageRequired: "اكتب رسالتك",
      },
      footer: "© 2026 مرحال. جميع الحقوق محفوظة.",
    },
    en: {
      heroTitle: "Help",
      heroSubtitle: "How can we help you?",
      nameLabel: "Name",
      namePlaceholder: "Your full name",
      emailLabel: "Email",
      emailPlaceholder: "example@email.com",
      requestTypeLabel: "Request Type",
      requestTypePlaceholder: "Select type",
      requestTypes: [
        { value: "inquiry", label: "General Inquiry" },
        { value: "technical", label: "Technical Issue" },
        { value: "feature", label: "Suggestion" },
        { value: "partnership", label: "Partnership" },
      ],
      messageLabel: "Message",
      messagePlaceholder: "Write your message here...",
      submitBtn: "Send",
      loadingBtn: "Sending...",
      successTitle: "Message Sent",
      successMessage: "We got your message. We'll be in touch soon.",
      sendAnother: "Send Another",
      errors: {
        nameRequired: "Enter your name",
        emailRequired: "Enter your email",
        emailInvalid: "Invalid email address",
        requestTypeRequired: "Select a request type",
        messageRequired: "Enter your message",
      },
      footer: "© 2026 Merhaal. All rights reserved.",
    },
  };

  const t = content[language];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.requestType) {
      newErrors.requestType = t.errors.requestTypeRequired;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.errors.messageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", requestType: "", message: "" });
    setErrors({});
    setIsSubmitted(false);
  };

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className={`min-h-screen bg-background flex flex-col ${isRTL ? "rtl" : "ltr"}`}
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

      <section className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {isSubmitted ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t.successTitle}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t.successMessage}
                </p>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-full"
                  onClick={handleReset}
                >
                  {t.sendAnother}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5"
                noValidate
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder={t.namePlaceholder}
                    className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                      errors.name ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1.5">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={t.emailPlaceholder}
                    dir="ltr"
                    className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                      errors.email ? "border-red-500" : "border-border"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.requestTypeLabel}
                  </label>
                  <select
                    value={formData.requestType}
                    onChange={(e) => handleChange("requestType", e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer ${
                      errors.requestType ? "border-red-500" : "border-border"
                    } ${!formData.requestType ? "text-muted-foreground" : ""}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: isRTL ? "left 1rem center" : "right 1rem center",
                    }}
                  >
                    <option value="" disabled>
                      {t.requestTypePlaceholder}
                    </option>
                    {t.requestTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.requestType && (
                    <p className="text-sm text-red-500 mt-1.5">{errors.requestType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.messageLabel}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none ${
                      errors.message ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1.5">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base font-medium gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.loadingBtn}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.submitBtn}
                    </>
                  )}
                </Button>
              </form>
            )}
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
