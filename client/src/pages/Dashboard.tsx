import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Plus, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();

  const tierInfo = {
    free: { name: 'مجاني', color: 'text-gray-600', limits: '1 يوم، 3 أنشطة/يوم، رحلة واحدة محفوظة' },
    smart: { name: 'ذكي', color: 'text-blue-600', limits: '10 أيام، 5 أنشطة/يوم، 3 رحلات محفوظة' },
    professional: { name: 'احترافي', color: 'text-purple-600', limits: 'غير محدود، حجز مباشر، مرشدين سياحيين' },
  };

  const currentTier = tierInfo[user?.tier || 'free'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">مرحباً {user?.name}!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              الباقة الحالية: <span className={`font-semibold ${currentTier.color}`}>{currentTier.name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{currentTier.limits}</p>
          </div>
          <Button 
            onClick={() => setLocation('/plan-trip')}
            className="bg-gradient-to-r from-green-700 to-green-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            خطط رحلة جديدة
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرحلات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips?.length || 0}</div>
              <p className="text-xs text-muted-foreground">رحلة مخططة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الوجهات المفضلة</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">وجهة محفوظة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الباقة</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentTier.color}`}>{currentTier.name}</div>
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setLocation('/pricing')}>
                ترقية الباقة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trips List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">رحلاتي</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : trips && trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{(trip.plan as any)?.destination || 'رحلة'}</CardTitle>
                    <CardDescription>
                      {trip.days} {trip.days === 1 ? 'يوم' : 'أيام'} • {trip.budget} ريال
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        الاهتمامات: {trip.interests.join(', ')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        تاريخ الإنشاء: {new Date(trip.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد رحلات بعد</h3>
                <p className="text-gray-500 mb-4">ابدأ بتخطيط رحلتك الأولى الآن!</p>
                <Button 
                  onClick={() => setLocation('/plan-trip')}
                  className="bg-gradient-to-r from-green-700 to-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  خطط رحلة جديدة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
