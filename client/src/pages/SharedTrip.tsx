import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Hotel, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";

export default function SharedTrip() {
  const [, params] = useRoute("/shared/:token");
  const { language, isRTL } = useLanguage();
  const shareToken = params?.token || '';

  const { data: trip, isLoading, error } = trpc.trips.getShared.useQuery(
    { shareToken },
    { enabled: !!shareToken }
  );

  const plan = trip?.plan as any;

  const getGoogleMapsUrl = (activityName: string, cityName: string) => {
    const query = encodeURIComponent(`${activityName} ${cityName} السعودية`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">الخطة غير موجودة</h2>
          <p className="text-muted-foreground">
            هذا الرابط غير صالح أو تم إلغاء المشاركة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <Badge variant="outline" className="mb-2">خطة مشاركة</Badge>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    {trip.destination}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {trip.days === 1 ? 'يوم واحد' : `${trip.days} أيام`}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                تاريخ الإنشاء: {new Date(trip.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>

          {plan?.accommodation && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hotel className="w-5 h-5 text-primary" />
                  الإقامة المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{plan.accommodation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.accommodation.class === 'luxury' ? 'فاخر' : 
                       plan.accommodation.class === 'mid' ? 'متوسط' : 'اقتصادي'}
                      {plan.accommodation.priceRange && ` • ${plan.accommodation.priceRange}`}
                    </p>
                  </div>
                  {plan.accommodation.googleMapsUrl && (
                    <a
                      href={plan.accommodation.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      عرض على خرائط Google
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <h2 className="text-xl font-bold">برنامج الرحلة اليومي</h2>
            
            {plan?.dailyPlan?.map((day: any) => (
              <Card key={day.day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {day.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.activities?.map((activity: any, actIdx: number) => (
                      <div 
                        key={actIdx}
                        className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <Badge variant="outline" className="text-xs">
                            {activity.period}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{activity.activity}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {activity.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <a
                          href={getGoogleMapsUrl(activity.activity, trip.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-primary hover:text-primary/80"
                          title="عرض على خرائط Google"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>تم إنشاء هذه الخطة بواسطة مرحال - رفيقك في السفر داخل السعودية</p>
          </div>
        </div>
      </main>
    </div>
  );
}
