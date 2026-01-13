import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Briefcase, Star } from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";

const tourGuides = [
  {
    id: 1,
    name: 'أحمد المالكي',
    nameEn: 'Ahmed Al-Malki',
    specialty: 'تراث وثقافة',
    specialtyEn: 'Heritage & Culture',
    cities: 'الرياض، جدة، الطائف',
    citiesEn: 'Riyadh, Jeddah, Taif',
    rating: 4.9,
    price: 200,
    experience: 8
  },
  {
    id: 2,
    name: 'فاطمة العتيبي',
    nameEn: 'Fatima Al-Otaibi',
    specialty: 'مغامرات وطبيعة',
    specialtyEn: 'Adventures & Nature',
    cities: 'أبها، العلا، تبوك',
    citiesEn: 'Abha, AlUla, Tabuk',
    rating: 4.8,
    price: 180,
    experience: 5
  },
  {
    id: 3,
    name: 'سعيد القحطاني',
    nameEn: 'Saeed Al-Qahtani',
    specialty: 'رحلات عائلية',
    specialtyEn: 'Family Trips',
    cities: 'الرياض، جدة، الدمام',
    citiesEn: 'Riyadh, Jeddah, Dammam',
    rating: 5.0,
    price: 250,
    experience: 10
  },
  {
    id: 4,
    name: 'نورة الشمري',
    nameEn: 'Noura Al-Shammari',
    specialty: 'سياحة دينية',
    specialtyEn: 'Religious Tourism',
    cities: 'مكة، المدينة',
    citiesEn: 'Makkah, Madinah',
    rating: 4.9,
    price: 220,
    experience: 7
  },
  {
    id: 5,
    name: 'خالد الدوسري',
    nameEn: 'Khalid Al-Dosari',
    specialty: 'سياحة تاريخية',
    specialtyEn: 'Historical Tourism',
    cities: 'العلا، الدرعية، الأحساء',
    citiesEn: 'AlUla, Diriyah, Al-Ahsa',
    rating: 4.7,
    price: 190,
    experience: 6
  },
  {
    id: 6,
    name: 'مريم الغامدي',
    nameEn: 'Maryam Al-Ghamdi',
    specialty: 'سياحة بحرية',
    specialtyEn: 'Marine Tourism',
    cities: 'جدة، ينبع، الوجه',
    citiesEn: 'Jeddah, Yanbu, Al-Wajh',
    rating: 4.8,
    price: 200,
    experience: 4
  }
];

export default function Guides() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleBookGuide = (guideName: string) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLocation('/login');
      return;
    }

    if (user?.tier !== 'pro') {
      toast.info('هذه الميزة متاحة للباقة الاحترافية فقط');
      return;
    }

    toast.success(`تم إرسال طلب حجز المرشد ${guideName}. سيتم التواصل معك قريباً`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="مرحال" className="h-10" />
              <h1 className="text-xl font-bold">المرشدون السياحيون</h1>
            </div>
            <Button variant="outline" onClick={() => setLocation('/')}>
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">مرشدون سياحيون محترفون</h2>
          <p className="text-gray-600 dark:text-gray-400">
            احجز مرشدين معتمدين لمرافقتك في رحلتك
          </p>
        </div>

        {!isAuthenticated && (
          <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <p className="text-blue-900 dark:text-blue-100 mb-4">
                يجب تسجيل الدخول للوصول إلى المرشدين السياحيين
              </p>
              <Button onClick={() => setLocation('/login')}>
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && user?.tier !== 'pro' && (
          <Card className="mb-8 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <p className="text-purple-900 dark:text-purple-100 mb-4">
                المرشدون متاحون للمشتركين الاحترافيين فقط
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => toast.info('صفحة الباقات قريباً')}
              >
                ترقية الباقة
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tourGuides.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl mb-3">
                    {guide.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{guide.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{guide.rating}</span>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {guide.specialty}
                  </p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{guide.cities}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>خبرة {guide.experience} سنوات</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {guide.price} ريال/ساعة
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => handleBookGuide(guide.name)}
                  disabled={!isAuthenticated || user?.tier !== 'pro'}
                >
                  {!isAuthenticated 
                    ? 'يجب تسجيل الدخول' 
                    : user?.tier !== 'pro' 
                    ? 'للمحترفين فقط' 
                    : 'احجز الآن'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
