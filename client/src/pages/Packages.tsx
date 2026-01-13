import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Crown, Sparkles, Gift } from "lucide-react";
import { toast } from "sonner";

export default function Packages() {
  const handleSelectPackage = (packageName: string) => {
    toast.success(`تم اختيار ${packageName}! سيتم التواصل معك لإتمام العملية`);
  };

  const packages = [
    {
      name: "مجاني",
      nameEn: "Free",
      price: 0,
      period: "دائماً",
      icon: <Gift className="w-12 h-12" />,
      color: "from-gray-500 to-gray-600",
      badge: "معاينة فقط",
      features: [
        { text: "معاينة النظام والتجربة", included: true },
        { text: "رحلة واحدة فقط (يوم واحد)", included: true },
        { text: "3 أنشطة كحد أقصى في اليوم", included: true },
        { text: "لا يمكن حفظ الخطط", included: false },
        { text: "لا يتوفر التخطيط الذكي", included: false },
        { text: "لا يتوفر الحجز المباشر", included: false },
        { text: "لا يتوفر المرشدون السياحيون", included: false },
      ],
    },
    {
      name: "ذكي",
      nameEn: "Smart",
      price: 14.99,
      period: "دفعة واحدة",
      icon: <Sparkles className="w-12 h-12" />,
      color: "from-blue-500 to-blue-600",
      badge: "الأكثر شعبية",
      popular: true,
      features: [
        { text: "رحلات حتى 10 أيام", included: true },
        { text: "5 أنشطة في اليوم", included: true },
        { text: "حفظ 3 خطط رحلات", included: true },
        { text: "خوارزمية التخطيط الذكي", included: true },
        { text: "فلاتر متقدمة للأنشطة", included: true },
        { text: "لا يتوفر الحجز المباشر", included: false },
        { text: "لا يتوفر المرشدون السياحيون", included: false },
      ],
    },
    {
      name: "احترافي",
      nameEn: "Professional",
      price: 29.99,
      period: "شهرياً",
      icon: <Crown className="w-12 h-12" />,
      color: "from-yellow-500 to-yellow-600",
      badge: "الأفضل",
      features: [
        { text: "رحلات حتى 14 يوماً", included: true },
        { text: "أنشطة غير محدودة", included: true },
        { text: "حفظ غير محدود للخطط", included: true },
        { text: "خوارزمية التخطيط الذكي المتقدمة", included: true },
        { text: "فلاتر متقدمة وتخصيص كامل", included: true },
        { text: "حجز مباشر للفنادق والأنشطة", included: true },
        { text: "حجز مرشدين سياحيين محترفين", included: true },
        { text: "دعم أولوية على مدار الساعة", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-yellow-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الباقات والأسعار</h1>
          <p className="text-xl text-white/90">اختر الباقة المناسبة لاحتياجاتك</p>
        </div>
      </div>

      {/* Free Note */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <p className="text-center text-lg">
            <strong className="text-green-700 dark:text-green-400">الاستخدام الأساسي مجاني!</strong>{" "}
            استمتع بمميزات مرحال الأساسية بدون تكلفة. الباقات أدناه للمميزات الإضافية فقط.
          </p>
        </Card>
      </div>

      {/* Packages Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${
                pkg.popular ? "ring-4 ring-blue-500 shadow-2xl scale-105" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-bold">
                  {pkg.badge}
                </div>
              )}

              <div className="p-8 space-y-6">
                {/* Icon */}
                <div className={`bg-gradient-to-r ${pkg.color} text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto`}>
                  {pkg.icon}
                </div>

                {/* Name & Price */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold">{pkg.price}</span>
                    {pkg.price > 0 && <span className="text-gray-600 dark:text-gray-400">ريال</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pkg.period}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-600 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPackage(pkg.name)}
                  className={`w-full ${
                    pkg.price === 0
                      ? "bg-gray-600 hover:bg-gray-700"
                      : `bg-gradient-to-r ${pkg.color} hover:opacity-90`
                  }`}
                  disabled={pkg.price === 0}
                >
                  {pkg.price === 0 ? "الباقة الحالية" : `اختر ${pkg.name}`}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">الأسئلة الشائعة</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">هل يمكنني تجربة الباقة المدفوعة قبل الشراء؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  نعم! الباقة المجانية تتيح لك تجربة النظام بشكل كامل مع قيود بسيطة. يمكنك الترقية في أي وقت.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">ما الفرق بين الباقة الذكية والاحترافية؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  الباقة الذكية مثالية للرحلات القصيرة (حتى 10 أيام) مع دفعة واحدة. الباقة الاحترافية توفر رحلات أطول، حجز مباشر، ومرشدين سياحيين.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">هل يمكنني إلغاء الاشتراك في أي وقت؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  نعم، يمكنك إلغاء الباقة الاحترافية في أي وقت. الباقة الذكية هي دفعة واحدة بدون تجديد تلقائي.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">كيف يتم الدفع؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  نقبل جميع طرق الدفع الإلكتروني: بطاقات الائتمان، مدى، Apple Pay، وSTC Pay.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
