import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { type DestinationCatalogItem } from "@/constants/destinationsCatalog";

interface CityDetailModalProps {
  destination: DestinationCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export function CityDetailModal({ destination, isOpen, onClose, language }: CityDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  if (!destination) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div>
          {/* Header Image */}
          <div className="relative h-64 md:h-96">
            <img
              src={destination.image || '/images/cities/riyadh-hero.jpg'}
              alt={language === 'ar' ? destination.name : destination.nameEn}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/cities/riyadh-hero.jpg';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {language === 'ar' ? destination.name : destination.nameEn}
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
                {language === 'ar' ? destination.description : destination.descriptionEn}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
