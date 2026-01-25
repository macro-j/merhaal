import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './drizzle/schema.js';
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log('Seeding database...');

  // Seed destinations
  const destinationsData = [
    {
      nameAr: 'الرياض',
      nameEn: 'Riyadh',
      titleAr: 'الرياض - قلب المملكة النابض',
      titleEn: 'Riyadh - The Vibrant Heart of the Kingdom',
      descriptionAr: 'عاصمة تجمع بين التراث العريق والحداثة المتقدمة. اكتشف أسواقها العريقة وتراثها الثقافي الغني وناطحات سحابها الشاهقة.',
      descriptionEn: 'A capital that blends rich heritage with modern advancement. Discover its ancient markets, cultural treasures, and towering skyscrapers.',
images: ['/images/cities/riyadh-hero.jpg']
    },
    {
      nameAr: 'جدة',
      nameEn: 'Jeddah',
      titleAr: 'جدة - عروس البحر الأحمر',
      titleEn: 'Jeddah - Bride of the Red Sea',
      descriptionAr: 'مدينة ساحلية بموروث عريق وطبيعة خلابة. استمتع بكورنيشها الساحر وثقافتها الإسلامية العميقة وشواطئها الرملية الذهبية.',
      descriptionEn: 'A coastal city with deep heritage and breathtaking nature. Enjoy its enchanting corniche, Islamic culture, and golden sandy beaches.',
images: ['/images/cities/jeddah-hero.jpg']
    },
    {
      nameAr: 'العلا',
      nameEn: 'AlUla',
      titleAr: 'العلا - متحف حي في الصحراء',
      titleEn: 'AlUla - A Living Museum in the Desert',
      descriptionAr: 'موقع يونسكو للتراث العالمي مع آثار عريقة وطبيعة خلابة. استكشف مدائن صالح والتكوينات الجيولوجية المذهلة.',
      descriptionEn: 'A UNESCO World Heritage site with ancient monuments and stunning nature. Explore Madain Saleh and geological wonders.',
images: ['/images/cities/alula-hero.jpg']
    },
    {
      nameAr: 'أبها',
      nameEn: 'Abha',
      titleAr: 'أبها - عروس الجنوب',
      titleEn: 'Abha - Bride of the South',
      descriptionAr: 'جبال خضراء وطبيعة ساحرة في منطقة عسير. استمتع بالمناخ المعتدل والمناظر الطبيعية الخلابة.',
      descriptionEn: 'Green mountains and charming nature in Asir region. Enjoy the moderate climate and stunning landscapes.',
images: ['/images/cities/abha-hero.jpg']
    }
    {
  nameAr: 'الطائف',
  nameEn: 'Taif',
  titleAr: 'الطائف - مدينة الورد',
  titleEn: 'Taif - City of Roses',
  descriptionAr: 'مدينة جبلية بأجواء لطيفة وطبيعة جميلة. استمتع بالمرتفعات والحدائق والأسواق الشعبية.',
  descriptionEn: 'A mountain city with pleasant weather and beautiful nature. Enjoy highlands, gardens, and local markets.',
  images: ['/images/cities/taif-hero.jpg'],
}

  ];

  const insertedDestinations = await db.insert(schema.destinations).values(destinationsData).$returningId();
  console.log(`Inserted ${insertedDestinations.length} destinations`);

  // Get destination IDs
  const riyadhId = insertedDestinations[0].id;
  const jeddahId = insertedDestinations[1].id;
  const alulaId = insertedDestinations[2].id;
  const abhaId = insertedDestinations[3].id;

  // Seed activities
  const activitiesData = [
    // Riyadh activities
    { destinationId: riyadhId, name: 'زيارة برج المملكة', type: 'ثقافة وتراث', duration: '2 ساعات', cost: '50', icon: 'fa-building', minTier: 'free', details: 'برج أيقوني مع إطلالة بانورامية على المدينة' },
    { destinationId: riyadhId, name: 'استكشاف الدرعية التاريخية', type: 'ثقافة وتراث', duration: '3 ساعات', cost: '0', icon: 'fa-landmark', minTier: 'free', details: 'موقع تراث عالمي يونسكو' },
    { destinationId: riyadhId, name: 'التسوق في العليا', type: 'تسوق وترفيه', duration: '2 ساعات', cost: '0', icon: 'fa-shopping-bag', minTier: 'free', details: 'منطقة تسوق حديثة مع مطاعم ومقاهي' },
    { destinationId: riyadhId, name: 'زيارة المتحف الوطني', type: 'ثقافة وتراث', duration: '2 ساعات', cost: '20', icon: 'fa-museum', minTier: 'free', details: 'متحف شامل للتاريخ السعودي' },
    { destinationId: riyadhId, name: 'جولة في حديقة الملك عبدالله', type: 'عائلي وأطفال', duration: '2 ساعات', cost: '0', icon: 'fa-tree', minTier: 'free', details: 'حديقة كبيرة مع مساحات خضراء' },
    
    // Jeddah activities
    { destinationId: jeddahId, name: 'المشي في كورنيش جدة', type: 'عائلي وأطفال', duration: '2 ساعات', cost: '0', icon: 'fa-water', minTier: 'free', details: 'كورنيش ساحلي جميل مع نافورة الملك فهد' },
    { destinationId: jeddahId, name: 'استكشاف البلد التاريخية', type: 'ثقافة وتراث', duration: '3 ساعات', cost: '0', icon: 'fa-city', minTier: 'free', details: 'حي تاريخي بأزقة ضيقة ومباني تقليدية' },
    { destinationId: jeddahId, name: 'زيارة متحف الفنون', type: 'ثقافة وتراث', duration: '2 ساعات', cost: '30', icon: 'fa-palette', minTier: 'free', details: 'معارض فنية محلية وعالمية' },
    { destinationId: jeddahId, name: 'الغوص في البحر الأحمر', type: 'مغامرات ورياضة', duration: '4 ساعات', cost: '200', icon: 'fa-fish', minTier: 'smart', details: 'تجربة غوص فريدة مع الشعاب المرجانية' },
    
    // AlUla activities
    { destinationId: alulaId, name: 'زيارة مدائن صالح', type: 'ثقافة وتراث', duration: '3 ساعات', cost: '95', icon: 'fa-landmark', minTier: 'free', details: 'موقع أثري نبطي مذهل' },
    { destinationId: alulaId, name: 'جولة في البلدة القديمة', type: 'ثقافة وتراث', duration: '2 ساعات', cost: '0', icon: 'fa-city', minTier: 'free', details: 'بلدة تاريخية بمباني طينية' },
    { destinationId: alulaId, name: 'رحلة صحراوية', type: 'مغامرات ورياضة', duration: '4 ساعات', cost: '150', icon: 'fa-mountain', minTier: 'smart', details: 'استكشاف الصحراء والتكوينات الصخرية' },
    
    // Abha activities
    { destinationId: abhaId, name: 'ركوب التلفريك', type: 'عائلي وأطفال', duration: '1 ساعة', cost: '30', icon: 'fa-cable-car', minTier: 'free', details: 'إطلالة رائعة على الجبال الخضراء' },
    { destinationId: abhaId, name: 'زيارة قرية المفتاحة', type: 'ثقافة وتراث', duration: '2 ساعات', cost: '0', icon: 'fa-home', minTier: 'free', details: 'قرية تراثية بفنون وحرف يدوية' },
    { destinationId: abhaId, name: 'التنزه في الحبلة', type: 'مغامرات ورياضة', duration: '3 ساعات', cost: '0', icon: 'fa-hiking', minTier: 'free', details: 'قرية جبلية معلقة مع مناظر خلابة' }
  ];

  const insertedActivities = await db.insert(schema.activities).values(activitiesData);
  console.log(`Inserted ${activitiesData.length} activities`);

  // Seed accommodations
  const accommodationsData = [
    // Riyadh
    { destinationId: riyadhId, name: 'فندق الفيصلية', type: 'فاخر', pricePerNight: '800', rating: '5.0', link: 'https://www.booking.com', features: ['مسبح', 'سبا', 'مطاعم متعددة'] },
    { destinationId: riyadhId, name: 'فندق النخيل الرياض', type: 'متوسط', pricePerNight: '400', rating: '4.0', link: 'https://www.booking.com', features: ['إفطار مجاني', 'واي فاي', 'موقف سيارات'] },
    { destinationId: riyadhId, name: 'فندق الوليد', type: 'اقتصادي', pricePerNight: '200', rating: '3.0', link: 'https://www.booking.com', features: ['نظيف', 'قريب من المعالم', 'واي فاي'] },
    
    // Jeddah
    { destinationId: jeddahId, name: 'فندق روز وود جدة', type: 'فاخر', pricePerNight: '900', rating: '5.0', link: 'https://www.booking.com', features: ['إطلالة على البحر', 'شاطئ خاص', 'مطاعم عالمية'] },
    { destinationId: jeddahId, name: 'فندق ميريديان جدة', type: 'متوسط', pricePerNight: '450', rating: '4.0', link: 'https://www.booking.com', features: ['قريب من الكورنيش', 'مسبح', 'إفطار'] },
    { destinationId: jeddahId, name: 'فندق البحر الأحمر', type: 'اقتصادي', pricePerNight: '250', rating: '3.0', link: 'https://www.booking.com', features: ['موقع مركزي', 'نظيف', 'قريب من الأسواق'] },
    
    // AlUla
    { destinationId: alulaId, name: 'منتجع شادن العلا', type: 'فاخر', pricePerNight: '1200', rating: '5.0', link: 'https://www.booking.com', features: ['تجربة صحراوية فاخرة', 'مطاعم', 'رحلات منظمة'] },
    { destinationId: alulaId, name: 'فندق ساحة العلا', type: 'متوسط', pricePerNight: '500', rating: '4.0', link: 'https://www.booking.com', features: ['قريب من المعالم', 'إفطار', 'جولات سياحية'] },
    { destinationId: alulaId, name: 'نزل الصحراء', type: 'اقتصادي', pricePerNight: '300', rating: '3.0', link: 'https://www.booking.com', features: ['تجربة أصيلة', 'نظيف', 'ضيافة محلية'] },
    
    // Abha
    { destinationId: abhaId, name: 'فندق قصر أبها', type: 'فاخر', pricePerNight: '700', rating: '4.8', link: 'https://www.booking.com', features: ['إطلالة جبلية', 'مطعم', 'خدمة ممتازة'] },
    { destinationId: abhaId, name: 'فندق الجبل الأخضر', type: 'متوسط', pricePerNight: '350', rating: '4.0', link: 'https://www.booking.com', features: ['موقع هادئ', 'إفطار', 'واي فاي'] },
    { destinationId: abhaId, name: 'شاليهات عسير', type: 'اقتصادي', pricePerNight: '180', rating: '3.5', link: 'https://www.booking.com', features: ['مناسب للعائلات', 'مطبخ', 'موقف سيارات'] }
  ];

  const insertedAccommodations = await db.insert(schema.accommodations).values(accommodationsData);
  console.log(`Inserted ${accommodationsData.length} accommodations`);

  // Seed restaurants
  const restaurantsData = [
    // Riyadh
    { destinationId: riyadhId, name: 'مطعم نجد فيليج', cuisine: 'سعودي تقليدي', priceRange: 'متوسط', avgPrice: '80', rating: '4.5', specialties: ['كبسة', 'مندي', 'جريش'], location: 'الرياض' },
    { destinationId: riyadhId, name: 'مطعم لوسين', cuisine: 'لبناني', priceRange: 'فاخر', avgPrice: '150', rating: '4.7', specialties: ['مشاوي', 'مقبلات', 'حلويات'], location: 'الرياض' },
    { destinationId: riyadhId, name: 'مطعم البيك', cuisine: 'وجبات سريعة', priceRange: 'اقتصادي', avgPrice: '30', rating: '4.3', specialties: ['دجاج', 'برجر', 'بطاطس'], location: 'الرياض' },
    
    // Jeddah
    { destinationId: jeddahId, name: 'مطعم البلد', cuisine: 'سعودي حجازي', priceRange: 'متوسط', avgPrice: '70', rating: '4.4', specialties: ['فول', 'سمبوسة', 'مطازيز'], location: 'جدة' },
    { destinationId: jeddahId, name: 'مطعم الصياد', cuisine: 'مأكولات بحرية', priceRange: 'متوسط', avgPrice: '100', rating: '4.6', specialties: ['سمك مشوي', 'جمبري', 'كاليماري'], location: 'جدة' },
    { destinationId: jeddahId, name: 'مطعم الرومانسية', cuisine: 'إيطالي', priceRange: 'فاخر', avgPrice: '180', rating: '4.7', specialties: ['باستا', 'بيتزا', 'ريزوتو'], location: 'جدة' },
    
    // AlUla
    { destinationId: alulaId, name: 'مطعم مرايا', cuisine: 'عالمي فاخر', priceRange: 'فاخر', avgPrice: '250', rating: '4.8', specialties: ['أطباق عالمية', 'تجربة فريدة', 'إطلالة مميزة'], location: 'العلا' },
    { destinationId: alulaId, name: 'مطعم الديرة', cuisine: 'سعودي تقليدي', priceRange: 'متوسط', avgPrice: '60', rating: '4.3', specialties: ['مندي', 'مظبي', 'قهوة عربية'], location: 'العلا' },
    
    // Abha
    { destinationId: abhaId, name: 'مطعم الجنوب', cuisine: 'سعودي جنوبي', priceRange: 'متوسط', avgPrice: '65', rating: '4.4', specialties: ['عريكة', 'مرقوق', 'قهوة'], location: 'أبها' },
    { destinationId: abhaId, name: 'مطعم الجبل', cuisine: 'عالمي', priceRange: 'فاخر', avgPrice: '120', rating: '4.5', specialties: ['ستيك', 'مأكولات متنوعة', 'حلويات'], location: 'أبها' }
  ];

  const insertedRestaurants = await db.insert(schema.restaurants).values(restaurantsData);
  console.log(`Inserted ${restaurantsData.length} restaurants`);

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
