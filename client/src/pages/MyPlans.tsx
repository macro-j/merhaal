import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Plus, ChevronDown, Trash2, Clock, FileDown, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export default function MyPlans() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { language, isRTL } = useLanguage();
  const { data: trips, isLoading, refetch } = trpc.trips.list.useQuery(undefined, {
    enabled: !!user,
  });
  const [openTrips, setOpenTrips] = useState<number[]>([]);
  const [exportingPdf, setExportingPdf] = useState<number | null>(null);
  const amiriFontRef = useRef<string | null>(null);

  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف الخطة' : 'Plan deleted');
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  const content = {
    ar: {
      title: 'خططي',
      subtitle: 'عرض وإدارة خطط رحلاتك المحفوظة',
      noTrips: 'لا توجد خطط محفوظة',
      noTripsDesc: 'لم تقم بحفظ أي خطة رحلة بعد',
      startBtn: 'ابدأ الآن',
      loading: 'جارٍ التحميل...',
      day: 'يوم',
      days: 'أيام',
      created: 'تاريخ الإنشاء',
      duration: 'المدة',
      delete: 'حذف',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الخطة؟',
      dayLabel: 'اليوم',
    },
    en: {
      title: 'My Plans',
      subtitle: 'View and manage your saved trip plans',
      noTrips: 'No saved plans',
      noTripsDesc: 'You haven\'t saved any trip plans yet',
      startBtn: 'Start Now',
      loading: 'Loading...',
      day: 'day',
      days: 'days',
      created: 'Created',
      duration: 'Duration',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this plan?',
      dayLabel: 'Day',
    }
  };

  const t = content[language];

  const toggleTrip = (tripId: number) => {
    setOpenTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId) 
        : [...prev, tripId]
    );
  };

  const handleDelete = (tripId: number) => {
    if (confirm(t.deleteConfirm)) {
      deleteMutation.mutate({ tripId });
    }
  };

  const loadAmiriFont = async (): Promise<string> => {
    if (amiriFontRef.current) return amiriFontRef.current;
    
    const response = await fetch('/fonts/Amiri-Regular.ttf');
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        amiriFontRef.current = base64;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleExportPDF = async (trip: any) => {
    setExportingPdf(trip.id);
    
    try {
      const fontData = await loadAmiriFont();
      const plan = trip.plan as any;
      const cityName = plan?.destination || `رحلة #${trip.id}`;
      
      const doc = new jsPDF();
      const pageWidth = 210;
      const rightMargin = pageWidth - 20;
      let y = 25;
      
      doc.addFileToVFS('Amiri-Regular.ttf', fontData);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.setFont('Amiri');
      
      doc.setFontSize(22);
      doc.text('خطة رحلة مرحال', rightMargin, y, { align: 'right' });
      y += 12;
      
      doc.setFontSize(16);
      doc.text(cityName, rightMargin, y, { align: 'right' });
      y += 15;
      
      doc.setFontSize(11);
      const daysText = trip.days === 1 ? 'يوم واحد' : `${trip.days} أيام`;
      doc.text(`المدة: ${daysText}`, rightMargin, y, { align: 'right' });
      y += 8;
      
      const dateStr = new Date(trip.createdAt).toLocaleDateString('ar-SA', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      doc.text(`تاريخ الإنشاء: ${dateStr}`, rightMargin, y, { align: 'right' });
      y += 15;
      
      if (plan?.accommodation) {
        doc.setFontSize(13);
        doc.text('الإقامة', rightMargin, y, { align: 'right' });
        y += 8;
        doc.setFontSize(10);
        doc.text(plan.accommodation.name || '', rightMargin - 10, y, { align: 'right' });
        y += 6;
        doc.text(`${plan.accommodation.type || ''} | ${plan.accommodation.pricePerNight || ''} ريال/ليلة`, rightMargin - 10, y, { align: 'right' });
        y += 15;
      }
      
      doc.setFontSize(14);
      doc.text('برنامج الرحلة اليومي', rightMargin, y, { align: 'right' });
      y += 12;
      
      const dayTitles = ['اليوم الأول', 'اليوم الثاني', 'اليوم الثالث', 'اليوم الرابع', 'اليوم الخامس', 
                         'اليوم السادس', 'اليوم السابع', 'اليوم الثامن', 'اليوم التاسع', 'اليوم العاشر'];
      
      plan?.dailyPlan?.forEach((day: any, dayIdx: number) => {
        if (y > 250) {
          doc.addPage();
          doc.setFont('Amiri');
          y = 25;
        }
        
        doc.setFontSize(12);
        const dayTitle = day.title || dayTitles[dayIdx] || `اليوم ${dayIdx + 1}`;
        doc.text(dayTitle, rightMargin, y, { align: 'right' });
        y += 9;
        
        doc.setFontSize(9);
        day.activities?.forEach((activity: any) => {
          if (y > 270) {
            doc.addPage();
            doc.setFont('Amiri');
            y = 25;
          }
          
          const timeStr = activity.time || '';
          const period = activity.period || '';
          const activityName = activity.activity || activity.name || '';
          
          doc.text(`${period} ${timeStr} - ${activityName}`, rightMargin - 5, y, { align: 'right' });
          y += 6;
          
          if (activity.description) {
            const desc = activity.description.length > 70 ? activity.description.substring(0, 67) + '...' : activity.description;
            doc.setTextColor(100);
            doc.text(desc, rightMargin - 10, y, { align: 'right' });
            doc.setTextColor(0);
            y += 6;
          }
          y += 2;
        });
        y += 6;
      });
      
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text('مرحال - رفيقك في السفر داخل السعودية', pageWidth / 2, 285, { align: 'center' });
      
      doc.save(`merhaal-trip-${trip.id}.pdf`);
      toast.success('تم تصدير الخطة بنجاح');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التصدير' : 'Error exporting PDF');
    } finally {
      setExportingPdf(null);
    }
  };

  const isProfessional = user?.tier === 'professional';

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t.subtitle}</p>
          </div>
          <Button onClick={() => setLocation('/plan-trip')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 me-2" />
            {t.startBtn}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        ) : trips?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t.noTrips}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t.noTripsDesc}</p>
              <Button onClick={() => setLocation('/plan-trip')}>
                <Plus className="w-4 h-4 me-2" />
                {t.startBtn}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trips?.map((trip) => {
              const plan = trip.plan as any;
              const cityName = plan?.destination || (language === 'ar' ? `رحلة #${trip.id}` : `Trip #${trip.id}`);
              const isOpen = openTrips.includes(trip.id);

              return (
                <Card key={trip.id} className="overflow-hidden">
                  <Collapsible open={isOpen} onOpenChange={() => toggleTrip(trip.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base sm:text-lg truncate">{cityName}</CardTitle>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {trip.days} {trip.days > 1 ? t.days : t.day}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(trip.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isProfessional && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              disabled={exportingPdf === trip.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportPDF(trip);
                              }}
                              title={language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                            >
                              {exportingPdf === trip.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(trip.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t">
                        {plan?.accommodation && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">{plan.accommodation.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {plan.accommodation.type} • {plan.accommodation.pricePerNight} {language === 'ar' ? 'ريال/ليلة' : 'SAR/night'}
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {plan?.dailyPlan?.map((day: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 sm:p-4">
                              <h5 className="font-medium text-sm sm:text-base text-primary mb-3">
                                {day.title || `${t.dayLabel} ${day.day}`}
                              </h5>
                              <div className="space-y-3">
                                {day.activities?.map((activity: any, actIdx: number) => (
                                  <div key={actIdx} className="flex items-start gap-3 text-sm border-s-2 border-primary/20 ps-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                          {activity.time} {activity.period || ''}
                                        </span>
                                        {activity.duration && (
                                          <span className="text-xs text-muted-foreground">
                                            {activity.duration}
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-medium text-sm">{activity.activity}</p>
                                      {activity.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground/70 mt-1">
                                        {activity.type}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
