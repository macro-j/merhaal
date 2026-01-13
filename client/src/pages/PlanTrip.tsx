import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Calendar, DollarSign, Heart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PlanTrip() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: destinations, isLoading: destinationsLoading } = trpc.destinations.list.useQuery();
  
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState(500);
  const [interests, setInterests] = useState<string[]>([]);
  const [accommodationType, setAccommodationType] = useState('متوسط');

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الرحلة بنجاح!');
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast.error('حدث خطأ: ' + error.message);
    },
  });

  const interestOptions = [
    'ثقافة وتراث',
    'تسوق وترفيه',
    'عائلي وأطفال',
    'طعام ومطاعم',
    'مغامرات ورياضة',
  ];

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDestination) {
      toast.error('الرجاء اختيار وجهة');
      return;
    }

    // Check tier limits
    const tier = user?.tier || 'free';
    if (tier === 'free' && days > 1) {
      toast.error('الباقة المجانية تسمح بيوم واحد فقط. قم بترقية باقتك للمزيد!');
      return;
    }
    if (tier === 'smart' && days > 10) {
      toast.error('الباقة الذكية تسمح بـ 10 أيام كحد أقصى. قم بالترقية للباقة الاحترافية!');
      return;
    }

    createTripMutation.mutate({
      destinationId: selectedDestination,
      days,
      budget,
      interests,
      accommodationType,
    });
  };

  const tierInfo = {
    free: { maxDays: 1, maxActivities: 3, maxTrips: 1 },
    smart: { maxDays: 10, maxActivities: 5, maxTrips: 3 },
    professional: { maxDays: Infinity, maxActivities: Infinity, maxTrips: Infinity },
  };

  const currentTier = tierInfo[user?.tier || 'free'];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">خطط رحلتك</h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختر وجهتك وحدد تفضيلاتك لنقوم بتوليد جدول رحلة مخصص لك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                اختر الوجهة
              </CardTitle>
              <CardDescription>اختر المدينة التي تريد زيارتها</CardDescription>
            </CardHeader>
            <CardContent>
              {destinationsLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destinations?.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedDestination === dest.id
                          ? 'border-purple-600 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                      }`}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={dest.images[0]}
                          alt={dest.nameAr}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-lg font-bold">{dest.nameAr}</h3>
                          <p className="text-sm text-gray-200">{dest.titleAr}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                تفاصيل الرحلة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days">عدد الأيام (الحد الأقصى: {currentTier.maxDays === Infinity ? 'غير محدود' : currentTier.maxDays})</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max={currentTier.maxDays === Infinity ? 365 : currentTier.maxDays}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">الميزانية (ريال)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="100"
                    step="100"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accommodation">نوع الإقامة</Label>
                <Select value={accommodationType} onValueChange={setAccommodationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="فاخر">فاخر</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="اقتصادي">اقتصادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                اهتماماتك
              </CardTitle>
              <CardDescription>اختر الأنشطة التي تفضلها (اختياري)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Button
                    key={interest}
                    type="button"
                    variant={interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                    className={interests.includes(interest) ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createTripMutation.isPending || !selectedDestination}
              className="flex-1 bg-gradient-to-r from-green-700 to-green-600 hover:from-purple-700 hover:to-blue-700"
            >
              {createTripMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                'توليد الخطة'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
