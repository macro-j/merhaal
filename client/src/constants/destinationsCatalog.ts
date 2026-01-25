export interface DestinationCatalogItem {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  image: string;
}

export const DESTINATIONS_CATALOG: DestinationCatalogItem[] = [
  {
    id: 'الرياض',
    slug: 'riyadh',
    name: 'الرياض',
    nameEn: 'Riyadh',
    subtitle: 'قلب المملكة النابض',
    subtitleEn: 'The Beating Heart of the Kingdom',
    description: 'عاصمة تجمع بين التراث والحداثة مع أسواق عريقة ومتاحف وواجهات حديثة',
    descriptionEn: 'A capital that combines heritage and modernity with traditional markets, museums and modern facades',
    image: '/images/cities/riyadh-hero.jpg',
  },
  {
    id: 'جدة',
    slug: 'jeddah',
    name: 'جدة',
    nameEn: 'Jeddah',
    subtitle: 'عروس البحر الأحمر',
    subtitleEn: 'Bride of the Red Sea',
    description: 'مدينة ساحلية بموروث عريق مع كورنيش ساحر وتراث إسلامي',
    descriptionEn: 'A coastal city with rich heritage, charming corniche and Islamic heritage',
    image: '/images/cities/jeddah-hero.jpg',
  },
  {
    id: 'الطائف',
    slug: 'taif',
    name: 'الطائف',
    nameEn: 'Taif',
    subtitle: 'مدينة الورد',
    subtitleEn: 'City of Roses',
    description: 'مصيف الجزيرة العربية بجبالها الخضراء وأجوائها المعتدلة وحدائق الورد',
    descriptionEn: 'Summer resort of Arabia with green mountains, mild weather and rose gardens',
    image: '/images/cities/taif-hero.jpg',
  },
  {
    id: 'أبها',
    slug: 'abha',
    name: 'أبها',
    nameEn: 'Abha',
    subtitle: 'عروس الجنوب',
    subtitleEn: 'Bride of the South',
    description: 'جبال خضراء وطبيعة ساحرة في منطقة عسير',
    descriptionEn: 'Green mountains and charming nature in Asir region',
    image: '/images/cities/abha-hero.jpg',
  },
  {
    id: 'العلا',
    slug: 'alula',
    name: 'العلا',
    nameEn: 'AlUla',
    subtitle: 'متحف حي في الصحراء',
    subtitleEn: 'A Living Museum in the Desert',
    description: 'موقع يونسكو مع طبيعة خلابة وآثار عريقة ومناظر صحراوية ساحرة',
    descriptionEn: 'UNESCO site with stunning nature, ancient ruins and charming desert landscapes',
    image: '/images/cities/alula-hero.jpg',
  },
];
