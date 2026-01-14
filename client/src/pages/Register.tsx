import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function Register() {
  const { language, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const content = {
    ar: {
      title: "إنشاء حساب",
      subtitle: "انضم إلى مرحال وابدأ رحلتك",
      nameLabel: "الاسم",
      namePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "٦ أحرف على الأقل",
      confirmPasswordLabel: "تأكيد كلمة المرور",
      confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
      submitBtn: "إنشاء الحساب",
      loadingBtn: "جارٍ الإنشاء...",
      hasAccount: "لديك حساب؟",
      signIn: "سجّل دخولك",
      errors: {
        nameRequired: "أدخل اسمك",
        emailRequired: "أدخل بريدك الإلكتروني",
        emailInvalid: "بريد إلكتروني غير صالح",
        passwordRequired: "أدخل كلمة المرور",
        passwordMin: "٦ أحرف على الأقل",
        confirmPasswordRequired: "أكد كلمة المرور",
        passwordMismatch: "كلمات المرور غير متطابقة",
      },
      footer: "© 2026 مرحال. جميع الحقوق محفوظة.",
    },
    en: {
      title: "Create Account",
      subtitle: "Join Merhaal and start your journey",
      nameLabel: "Name",
      namePlaceholder: "Your full name",
      emailLabel: "Email",
      emailPlaceholder: "example@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 6 characters",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Re-enter password",
      submitBtn: "Create Account",
      loadingBtn: "Creating...",
      hasAccount: "Have an account?",
      signIn: "Sign in",
      errors: {
        nameRequired: "Enter your name",
        emailRequired: "Enter your email",
        emailInvalid: "Invalid email address",
        passwordRequired: "Enter a password",
        passwordMin: "At least 6 characters",
        confirmPasswordRequired: "Confirm your password",
        passwordMismatch: "Passwords don't match",
      },
      footer: "© 2026 Merhaal. All rights reserved.",
    },
  };

  const t = content[language];

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      login(data.token);
      setLocation("/dashboard");
    },
    onError: (error) => {
      setErrors((prev) => ({ ...prev, general: error.message }));
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = t.errors.nameRequired;
    }

    if (!email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!password.trim()) {
      newErrors.password = t.errors.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = t.errors.passwordMin;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    registerMutation.mutate({ name, email, password });
  };

  const handleFieldChange = (field: keyof FormErrors, value: string) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
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

      <section className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl border border-border p-6 space-y-5 form-transition"
            noValidate
          >
            {errors.general && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
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
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
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
                {t.passwordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder={t.passwordPlaceholder}
                dir="ltr"
                className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                  errors.password ? "border-red-500" : "border-border"
                } ${isRTL ? "text-right" : "text-left"}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1.5">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.confirmPasswordLabel}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
                dir="ltr"
                className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                  errors.confirmPassword ? "border-red-500" : "border-border"
                } ${isRTL ? "text-right" : "text-left"}`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-medium"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t.loadingBtn}
                </>
              ) : (
                t.submitBtn
              )}
            </Button>

            <div className="text-center pt-2">
              <span className="text-sm text-muted-foreground">
                {t.hasAccount}{" "}
              </span>
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-sm text-primary font-medium hover:underline"
              >
                {t.signIn}
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer
        className="bg-secondary/50 py-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/70">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
