import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { X, MapPin, Hotel, Utensils, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface CityDetailModalProps {
  cityId: string | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export function CityDetailModal({ cityId, isOpen, onClose, language }: CityDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: destination, isLoading } = trpc.destinations.getByName.useQuery(
    { name: cityId || '' },
    { enabled: !!cityId }
  );

  const { data: activities } = trpc.destinations.getActivities.useQuery(
    { destinationId: destination?.id || 0 },
    { enabled: !!destination?.id }
  );

  const { data: hotels } = trpc.destinations.getAccommodations.useQuery(
    { destinationId: destination?.id || 0 },
    { enabled: !!destination?.id }
  );

  const { data: restaurants } = trpc.destinations.getRestaurants.useQuery(
    { destinationId: destination?.id || 0 },
    { enabled: !!destination?.id }
  );

  if (!cityId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : destination ? (
          <div>
            {/* Header Image */}
            <div className="relative h-64 md:h-96">
              <img
                src={destination.images?.[0] || '/images/cities/riyadh-hero.jpg'}
                alt={language === 'ar' ? destination.nameAr : destination.nameEn}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {language === 'ar' ? destination.nameAr : destination.nameEn}
                </h2>
                <p className="text-white/90 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xl font-bold mb-3">
                  {language === 'ar' ? 'عن المدينة' : 'About the City'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'ar' ? destination.descriptionAr : destination.descriptionEn}
                </p>
              </div>
              
              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  className="w-full h-12 rounded-full text-base font-medium"
                  onClick={() => {
                    onClose();
                    if (isAuthenticated) {
                      setLocation('/plan-trip');
                    } else {
                      setLocation('/login?redirect=/plan-trip');
                    }
                  }}
                >
                  {language === 'ar' ? 'أنشئ خطة رحلتك' : 'Plan Your Trip'}
                </Button>
              </div>

              {/* Activities */}
              {activities && activities.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {language === 'ar' ? 'الأنشطة السياحية' : 'Tourist Activities'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-2">{activity.name}</h4>
                        {activity.details && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {activity.details}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {activity.cost} {language === 'ar' ? 'ريال' : 'SAR'}
                          </span>
                          <span className="text-gray-500">
                            {activity.duration} {language === 'ar' ? 'ساعة' : 'hours'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {hotels && hotels.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Hotel className="w-5 h-5" />
                    {language === 'ar' ? 'الفنادق المقترحة' : 'Recommended Hotels'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{hotel.name}</h4>
                          {hotel.rating && <span className="text-yellow-500">★ {hotel.rating}</span>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {hotel.type}
                        </p>
                        <p className="text-purple-600 dark:text-purple-400 font-medium">
                          {language === 'ar' ? 'من' : 'From'} {hotel.pricePerNight} {language === 'ar' ? 'ريال/ليلة' : 'SAR/night'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {restaurants && restaurants.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {language === 'ar' ? 'المطاعم المقترحة' : 'Recommended Restaurants'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.map((restaurant) => (
                      <div key={restaurant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-2">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {restaurant.cuisine}
                        </p>
                        <p className="text-purple-600 dark:text-purple-400 font-medium">
                          {language === 'ar' ? 'متوسط السعر:' : 'Average price:'} {restaurant.avgPrice} {language === 'ar' ? 'ريال' : 'SAR'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p>{language === 'ar' ? 'لم يتم العثور على المدينة' : 'City not found'}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
