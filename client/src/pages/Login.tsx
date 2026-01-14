import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function Login() {
  const { language, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const content = {
    ar: {
      title: "تسجيل الدخول",
      subtitle: "أدخل بياناتك للمتابعة",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "••••••••",
      submitBtn: "دخول",
      loadingBtn: "جارٍ الدخول...",
      noAccount: "ليس لديك حساب؟",
      createAccount: "أنشئ حساباً",
      forgotPassword: "نسيت كلمة المرور؟",
      errors: {
        emailRequired: "أدخل بريدك الإلكتروني",
        emailInvalid: "بريد إلكتروني غير صالح",
        passwordRequired: "أدخل كلمة المرور",
      },
      footer: "© 2026 مرحال. جميع الحقوق محفوظة.",
    },
    en: {
      title: "Sign In",
      subtitle: "Enter your details to continue",
      emailLabel: "Email",
      emailPlaceholder: "example@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      submitBtn: "Sign In",
      loadingBtn: "Signing in...",
      noAccount: "No account?",
      createAccount: "Create one",
      forgotPassword: "Forgot password?",
      errors: {
        emailRequired: "Enter your email",
        emailInvalid: "Invalid email address",
        passwordRequired: "Enter your password",
      },
      footer: "© 2026 Merhaal. All rights reserved.",
    },
  };

  const t = content[language];

  const loginMutation = trpc.auth.login.useMutation({
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

    if (!email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!password.trim()) {
      newErrors.password = t.errors.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    loginMutation.mutate({ email, password });
  };

  const handleFieldChange = (field: keyof FormErrors, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
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
            className="bg-card rounded-2xl border border-border p-6 space-y-5"
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

            <div className="text-end">
              <button
                type="button"
                onClick={() => setLocation("/forgot-password")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.forgotPassword}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
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
                {t.noAccount}{" "}
              </span>
              <button
                type="button"
                onClick={() => setLocation("/register")}
                className="text-sm text-primary font-medium hover:underline"
              >
                {t.createAccount}
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
