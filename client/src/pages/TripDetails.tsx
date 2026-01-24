import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, DollarSign, Hotel, Clock, ExternalLink, FileDown, Loader2, ArrowRight, Sparkles, Share2, Link, Copy, X, MessageCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TripDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/trip/:id");
  const [, setLocation] = useLocation();
  const { language, isRTL } = useLanguage();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const tripId = params?.id ? parseInt(params.id) : null;
  const { data: trips, isLoading, refetch } = trpc.trips.list.useQuery(undefined, {
    enabled: !!user,
  });

  const generateShareMutation = trpc.trips.generateShareLink.useMutation({
    onSuccess: (data) => {
      const url = `${window.location.origin}/shared/${data.shareToken}`;
      setShareUrl(url);
      setShareDialogOpen(true);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء رابط المشاركة');
    },
  });

  const removeShareMutation = trpc.trips.removeShareLink.useMutation({
    onSuccess: () => {
      setShareUrl(null);
      setShareDialogOpen(false);
      refetch();
      toast.success('تم إلغاء المشاركة');
    },
  });

  const trip = trips?.find((t: any) => t.id === tripId);
  const plan = trip?.plan as any;
  const isProfessional = user?.tier === 'professional';
  const canShare = user?.tier === 'smart' || user?.tier === 'professional';

  const handleExportPDF = async () => {
    if (!tripId) return;
    setExportingPdf(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`/api/plans/${tripId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 && errorData.code === 'TIER_REQUIRED') {
          toast.error('تصدير PDF متاح فقط لمستخدمي الباقة الاحترافية');
        } else if (response.status === 404) {
          toast.error('الخطة غير موجودة');
        } else {
          toast.error(errorData.error || 'حدث خطأ أثناء التصدير');
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merhaal-trip-${tripId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تصدير الخطة بنجاح');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    } finally {
      setExportingPdf(false);
    }
  };

  const getGoogleMapsUrl = (activityName: string, cityName: string) => {
    const query = encodeURIComponent(`${activityName} ${cityName} السعودية`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getBestTimeToVisit = (period: string, type: string): string | null => {
    if (!isProfessional) return null;
    
    const rules: Record<string, Record<string, string>> = {
      'صباحًا': {
        'سياحة': 'أفضل وقت للزيارة - الجو معتدل صباحًا',
        'طبيعة': 'وقت مثالي للتصوير - إضاءة طبيعية ممتازة',
        'ثقافة': 'أقل ازدحامًا في الصباح الباكر',
      },
      'ظهرًا': {
        'تسوق': 'أفضل وقت للتسوق - المتاجر مفتوحة بالكامل',
        'طعام': 'وقت الغداء - تجربة مطاعم متكاملة',
      },
      'عصرًا': {
        'ثقافة': 'أفضل وقت لزيارة المتاحف',
        'تسوق': 'أجواء مميزة في الأسواق الشعبية',
      },
      'مساءً': {
        'طعام': 'أفضل تجربة للمطاعم والمقاهي',
        'سياحة': 'مناظر خلابة عند الغروب',
        'طبيعة': 'وقت مثالي للتنزه',
      },
    };
    
    return rules[period]?.[type] || null;
  };

  const handleShare = () => {
    if (!tripId) return;
    if (trip?.shareToken) {
      const url = `${window.location.origin}/shared/${trip.shareToken}`;
      setShareUrl(url);
      setShareDialogOpen(true);
    } else {
      generateShareMutation.mutate({ tripId });
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ الرابط');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">الرحلة غير موجودة</h2>
          <Button onClick={() => setLocation('/my-plans')}>
            العودة لخططي
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  {plan?.destination || 'رحلة جديدة'}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {trip.days} {trip.days === 1 ? 'يوم' : 'أيام'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {trip.budget} ريال
                  </span>
                  {trip.accommodationType && (
                    <span className="flex items-center gap-1">
                      <Hotel className="w-4 h-4" />
                      {trip.accommodationType}
                    </span>
                  )}
                </div>
                {trip.interests && trip.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {trip.interests.map((interest: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {canShare && (
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                    disabled={generateShareMutation.isPending}
                    className="gap-2"
                  >
                    {generateShareMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    مشاركة
                  </Button>
                )}
                {isProfessional && (
                  <Button 
                    variant="outline"
                    onClick={() => setAiChatOpen(true)}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    مساعد الرحلة
                  </Button>
                )}
                {isProfessional && (
                  <Button 
                    onClick={handleExportPDF}
                    disabled={exportingPdf}
                    className="gap-2"
                  >
                    {exportingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    تصدير PDF
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {plan?.accommodation ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hotel className="w-5 h-5 text-primary" />
                الإقامة المقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{plan.accommodation.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.accommodation.class === 'luxury' ? 'فاخر' : 
                     plan.accommodation.class === 'mid' ? 'متوسط' : 'اقتصادي'}
                    {plan.accommodation.priceRange && ` • ${plan.accommodation.priceRange}`}
                  </p>
                  {plan?.accommodationSelectionNote && (
  <p className="mt-1 text-sm text-muted-foreground">
    {plan.accommodationSelectionNote}
  </p>
)}

                </div>
                <a
                  href={plan.accommodation.googleMapsUrl || getGoogleMapsUrl(plan.accommodation.name, plan.destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  عرض على خرائط Google
                </a>
              </div>
              
              {(plan?.dailyBudget || plan?.accommodationCostPerNight || plan?.remainingAfterAccommodation) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {plan?.dailyBudget && (
                      <div>
                        <p className="text-muted-foreground">ميزانية اليوم</p>
                        <p className="font-semibold text-primary">{Math.round(plan.dailyBudget)} ر.س</p>
                      </div>
                    )}
                    {plan?.accommodationCostPerNight !== undefined && (
                      <div>
                        <p className="text-muted-foreground">تكلفة السكن/ليلة (تقديري)</p>
                        <p className="font-semibold text-primary">{Math.round(plan.accommodationCostPerNight)} ر.س</p>
                      </div>
                    )}
                    {plan?.remainingAfterAccommodation !== undefined && (
                      <div>
                        <p className="text-muted-foreground">المتبقي بعد السكن</p>
                        <p className="font-semibold text-primary">{Math.round(plan.remainingAfterAccommodation)} ر.س</p>
                      </div>
                    )}
                  </div>
                  {plan?.budgetNote && (
                    <p className="mt-3 text-xs text-muted-foreground italic">
                      {plan.budgetNote}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : plan?.noAccommodationMessage ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hotel className="w-5 h-5 text-muted-foreground" />
                الإقامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-2">
                {plan.noAccommodationMessage}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          <h2 className="text-xl font-bold">برنامج الرحلة اليومي</h2>
          
          {plan?.dailyPlan?.map((day: any, dayIdx: number) => (
            <Card key={dayIdx}>
              <CardHeader className="pb-3 bg-muted/30">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {day.title || `اليوم ${day.day}`}
                  </CardTitle>
                  {day.dayBudgetSummary && (
                    <p className="text-xs text-muted-foreground">
                      ملخص اليوم: ميزانية {Math.round(day.dayBudgetSummary.dailyBudget)} ر.س • السكن {Math.round(day.dayBudgetSummary.accommodationCostPerNight)} ر.س • الأنشطة {Math.round(day.dayBudgetSummary.activitiesCost ?? 0)} ر.س • المتبقي بعد الأنشطة {Math.round(day.dayBudgetSummary.remainingAfterActivities ?? day.dayBudgetSummary.remainingAfterAccommodation ?? 0)} ر.س
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {day.activities?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    لا توجد أنشطة لهذا اليوم
                  </p>
                ) : (
                  day.activities?.map((activity: any, actIdx: number) => {
                    const bestTime = getBestTimeToVisit(activity.period, activity.type);
                    return (
                      <div 
                        key={actIdx} 
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                       <div className="flex items-center gap-3 text-primary font-medium min-w-[120px]">
  <Clock className="w-4 h-4" />
  <div className="text-sm space-y-0.5">
    {activity.startTime && activity.endTime ? (
      <>
        <div className="font-medium">
          {activity.startTime} – {activity.endTime}
        </div>
        {activity.period && (
          <div className="text-muted-foreground">
            {activity.period}
          </div>
        )}
      </>
    ) : (
      <>
        <div>{activity.period}</div>
        <div className="text-muted-foreground">{activity.time}</div>
      </>
    )}
  </div>
</div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            {activity.activity || activity.name}
                          </h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            {activity.duration && (
                              <Badge variant="outline">{activity.duration}</Badge>
                            )}
                            {activity.type && (
                              <Badge variant="secondary">{activity.type}</Badge>
                            )}
                            {activity.cost && parseFloat(activity.cost) > 0 && (
                              <Badge variant="outline">{activity.cost} ريال</Badge>
                            )}
                          </div>
                          
                          {bestTime && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <Sparkles className="w-3 h-3" />
                              {bestTime}
                            </div>
                          )}
                        </div>
                        
                        <a
                          href={getGoogleMapsUrl(activity.activity || activity.name, plan.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm whitespace-nowrap"
                        >
                          <ExternalLink className="w-4 h-4" />
                          خرائط Google
                        </a>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setLocation('/my-plans')}>
            <ArrowRight className="w-4 h-4 me-2" />
            العودة لخططي
          </Button>
        </div>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              مشاركة الخطة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              شارك هذا الرابط مع الآخرين ليتمكنوا من مشاهدة خطة رحلتك
            </p>
            <div className="flex gap-2">
              <Input 
                value={shareUrl || ''} 
                readOnly 
                className="flex-1" 
                dir="ltr"
              />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => tripId && removeShareMutation.mutate({ tripId })}
                disabled={removeShareMutation.isPending}
              >
                {removeShareMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : (
                  <X className="w-4 h-4 me-2" />
                )}
                إلغاء المشاركة
              </Button>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                إغلاق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              مساعد الرحلة الذكي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">ميزة قادمة حصريًا للاحترافي</h3>
              <p className="text-sm text-muted-foreground">
                قريبًا ستتمكن من التحدث مع مساعد ذكي لتعديل خطتك:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1" dir="rtl">
                <li>• "خل اليوم الثاني مطاعم أكثر"</li>
                <li>• "قلل التسوق وزد الطبيعة"</li>
                <li>• "أضف أنشطة مسائية"</li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => setAiChatOpen(false)}>
              حسنًا
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
