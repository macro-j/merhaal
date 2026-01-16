import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MapPin, Plus, Star, Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { language, isRTL } = useLanguage();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'smart' | 'professional' | null>(null);

  const tierInfo = {
    free: { 
      name: language === 'ar' ? 'مجاني' : 'Free', 
      nameEn: 'Free',
      color: 'text-muted-foreground', 
      bgColor: 'bg-muted',
      limits: language === 'ar' ? 'يوم واحد، 3 أنشطة، رحلة واحدة' : '1 day, 3 activities, 1 trip'
    },
    smart: { 
      name: language === 'ar' ? 'ذكي' : 'Smart', 
      nameEn: 'Smart',
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      limits: language === 'ar' ? '10 أيام، 5 أنشطة، 3 رحلات' : '10 days, 5 activities, 3 trips'
    },
    professional: { 
      name: language === 'ar' ? 'احترافي' : 'Professional', 
      nameEn: 'Professional',
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      limits: language === 'ar' ? 'غير محدود' : 'Unlimited'
    },
  };

  const currentTier = tierInfo[user?.tier || 'free'];

  const handleUpgradeRequest = () => {
    if (selectedTier) {
      toast.success(language === 'ar' 
        ? `تم إرسال طلب الترقية إلى باقة ${tierInfo[selectedTier].name}. سيتم التواصل معك قريبًا.`
        : `Upgrade request to ${tierInfo[selectedTier].nameEn} sent. We'll contact you soon.`
      );
      setShowUpgradeModal(false);
      setSelectedTier(null);
    }
  };

  const content = {
    ar: {
      welcome: 'مرحبًا',
      currentTier: 'الباقة الحالية',
      planTrip: 'خطط رحلة جديدة',
      totalTrips: 'إجمالي الرحلات',
      plannedTrip: 'رحلة مخططة',
      favorites: 'الوجهات المفضلة',
      savedDest: 'وجهة محفوظة',
      tier: 'الباقة',
      upgradeTier: 'ترقية الباقة',
      myTrips: 'رحلاتي',
      loading: 'جارٍ التحميل...',
      days: 'أيام',
      day: 'يوم',
      sar: 'ريال',
      interests: 'الاهتمامات',
      createdOn: 'تاريخ الإنشاء',
      viewDetails: 'عرض التفاصيل',
      noTrips: 'لا توجد رحلات بعد',
      startPlanning: 'ابدأ بتخطيط رحلتك الأولى الآن!',
      upgradeTitle: 'ترقية الباقة',
      upgradeDesc: 'اختر الباقة المناسبة لك',
      requestUpgrade: 'طلب الترقية',
      cancel: 'إلغاء',
    },
    en: {
      welcome: 'Welcome',
      currentTier: 'Current Tier',
      planTrip: 'Plan New Trip',
      totalTrips: 'Total Trips',
      plannedTrip: 'planned trip',
      favorites: 'Favorite Destinations',
      savedDest: 'saved destination',
      tier: 'Tier',
      upgradeTier: 'Upgrade',
      myTrips: 'My Trips',
      loading: 'Loading...',
      days: 'days',
      day: 'day',
      sar: 'SAR',
      interests: 'Interests',
      createdOn: 'Created on',
      viewDetails: 'View Details',
      noTrips: 'No trips yet',
      startPlanning: 'Start planning your first trip now!',
      upgradeTitle: 'Upgrade Your Plan',
      upgradeDesc: 'Choose the right plan for you',
      requestUpgrade: 'Request Upgrade',
      cancel: 'Cancel',
    }
  };
  const t = content[language];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t.welcome} {user?.name}!</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${currentTier.bgColor} ${currentTier.color} font-medium`}>
                {currentTier.name}
              </span>
              <span className="text-sm text-muted-foreground">{currentTier.limits}</span>
            </div>
          </div>
          <Button onClick={() => setLocation('/plan-trip')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 me-2" />
            {t.planTrip}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalTrips}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{t.plannedTrip}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.favorites}</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">{t.savedDest}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.tier}</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${currentTier.color}`}>{currentTier.name}</div>
              {user?.tier !== 'professional' && (
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowUpgradeModal(true)}>
                  {t.upgradeTier}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">{t.myTrips}</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : trips && trips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/my-plans')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{(trip.plan as any)?.destination || (language === 'ar' ? 'رحلة' : 'Trip')}</CardTitle>
                    <CardDescription>
                      {trip.days} {trip.days === 1 ? t.day : t.days} • {trip.budget} {t.sar}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground text-xs">
                        {new Date(trip.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t.noTrips}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{t.startPlanning}</p>
                <Button onClick={() => setLocation('/plan-trip')}>
                  <Plus className="w-4 h-4 me-2" />
                  {t.planTrip}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t.upgradeTitle}
              </DialogTitle>
              <DialogDescription>{t.upgradeDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {user?.tier !== 'smart' && (
                <button
                  onClick={() => setSelectedTier('smart')}
                  className={`w-full p-4 rounded-lg border text-start transition-colors ${
                    selectedTier === 'smart' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">{tierInfo.smart.name}</span>
                    <span className="text-xs text-muted-foreground">{tierInfo.smart.limits}</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => setSelectedTier('professional')}
                className={`w-full p-4 rounded-lg border text-start transition-colors ${
                  selectedTier === 'professional' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-600">{tierInfo.professional.name}</span>
                  <span className="text-xs text-muted-foreground">{tierInfo.professional.limits}</span>
                </div>
              </button>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>{t.cancel}</Button>
              <Button onClick={handleUpgradeRequest} disabled={!selectedTier}>{t.requestUpgrade}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
