import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";
import { Target, Users, Award, Heart } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="مرحال" className="h-10" />
              <h1 className="text-xl font-bold">من نحن</h1>
            </div>
            <Button variant="outline" onClick={() => setLocation('/')}>
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">مرحال</h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            منصتك الذكية لتخطيط الرحلات السياحية داخل المملكة العربية السعودية
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">رسالتنا</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                نسعى لجعل تخطيط الرحلات السياحية في السعودية تجربة سهلة وممتعة من خلال توفير أدوات ذكية 
                تساعد المسافرين على اكتشاف أجمل الوجهات وتنظيم رحلاتهم بكل احترافية.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">رؤيتنا</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                أن نكون المنصة الأولى والأكثر ثقة لتخطيط الرحلات السياحية في المملكة، ونساهم في تعزيز 
                السياحة الداخلية وإبراز جمال وتنوع الوجهات السعودية.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center mb-8">ما نقدمه</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">تخطيط ذكي</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  خوارزميات ذكية لتوليد جداول رحلات مخصصة حسب ميزانيتك واهتماماتك
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">وجهات متنوعة</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  اكتشف أجمل المدن السعودية من الرياض إلى جدة والعلا وأبها
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">مرشدون محترفون</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  احجز مرشدين سياحيين معتمدين لمرافقتك في رحلتك
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold mb-6 text-center">قصتنا</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                بدأت فكرة مرحال من حاجة حقيقية لتسهيل عملية تخطيط الرحلات السياحية داخل المملكة. 
                لاحظنا أن الكثير من الناس يواجهون صعوبة في تنظيم رحلاتهم واختيار الوجهات والأنشطة المناسبة.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                قررنا إنشاء منصة ذكية تجمع كل ما يحتاجه المسافر في مكان واحد: معلومات عن الوجهات، 
                اقتراحات للأنشطة والفنادق والمطاعم، وأداة لتوليد جداول رحلات مخصصة تناسب كل شخص.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                اليوم، نفخر بأن مرحال أصبحت منصة موثوقة تساعد آلاف المسافرين على اكتشاف جمال السعودية 
                والاستمتاع برحلات لا تُنسى.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">جاهز لبدء رحلتك؟</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ التخطيط الآن مع مرحال واكتشف أجمل الوجهات السعودية
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-700 to-green-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setLocation('/plan-trip')}
          >
            ابدأ التخطيط الآن
          </Button>
        </div>
      </div>
    </div>
  );
}
