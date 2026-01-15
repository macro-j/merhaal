import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyPlans() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { language, isRTL } = useLanguage();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  const content = {
    ar: {
      title: 'خططي',
      subtitle: 'عرض وإدارة خطط رحلاتك',
      noTrips: 'لا توجد خطط محفوظة',
      noTripsDesc: 'ابدأ بتخطيط رحلتك الأولى الآن!',
      createBtn: 'خطط رحلة جديدة',
      loading: 'جارٍ التحميل...',
      day: 'اليوم',
      days: 'أيام',
      budget: 'الميزانية',
      sar: 'ريال',
      viewDetails: 'عرض التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      accommodation: 'الإقامة',
      dailyPlan: 'الخطة اليومية',
    },
    en: {
      title: 'My Plans',
      subtitle: 'View and manage your trip plans',
      noTrips: 'No saved plans',
      noTripsDesc: 'Start planning your first trip now!',
      createBtn: 'Plan New Trip',
      loading: 'Loading...',
      day: 'Day',
      days: 'days',
      budget: 'Budget',
      sar: 'SAR',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      accommodation: 'Accommodation',
      dailyPlan: 'Daily Plan',
    }
  };

  const t = content[language];

  const toggleExpand = (tripId: number) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button onClick={() => setLocation('/plan-trip')}>
            <Plus className="w-4 h-4 me-2" />
            {t.createBtn}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        ) : trips?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noTrips}</h3>
              <p className="text-muted-foreground mb-4">{t.noTripsDesc}</p>
              <Button onClick={() => setLocation('/plan-trip')}>
                <Plus className="w-4 h-4 me-2" />
                {t.createBtn}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips?.map((trip) => (
              <Card key={trip.id}>
                <CardHeader className="cursor-pointer" onClick={() => toggleExpand(trip.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {(trip.plan as any)?.destination || `رحلة #${trip.id}`}
                        </CardTitle>
                        <CardDescription>
                          {trip.days} {t.days} • {t.budget}: {trip.budget} {t.sar}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedTrip === trip.id ? (
                        <>
                          {t.hideDetails}
                          <ChevronUp className="w-4 h-4 ms-2" />
                        </>
                      ) : (
                        <>
                          {t.viewDetails}
                          <ChevronDown className="w-4 h-4 ms-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedTrip === trip.id && (
                  <CardContent className="border-t pt-4">
                    {(trip.plan as any)?.accommodation && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">{t.accommodation}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(trip.plan as any).accommodation.name} - {(trip.plan as any).accommodation.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(trip.plan as any).accommodation.pricePerNight} {t.sar}/ليلة
                        </p>
                      </div>
                    )}

                    <h4 className="font-medium mb-3">{t.dailyPlan}</h4>
                    <div className="space-y-4">
                      {(trip.plan as any)?.dailyPlan?.map((day: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2 text-primary">
                            {t.day} {day.day}
                          </h5>
                          <div className="space-y-2">
                            {day.activities?.map((activity: any, actIdx: number) => (
                              <div key={actIdx} className="flex items-start gap-3 text-sm">
                                <span className="text-muted-foreground w-20 flex-shrink-0">
                                  {activity.time}
                                </span>
                                <div>
                                  <p className="font-medium">{activity.activity}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {activity.type} {activity.duration && `• ${activity.duration}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
