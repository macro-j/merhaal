import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users } from "../drizzle/schema";

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getPool(): Promise<pg.Pool | null> {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      return null;
    }
  }
  return _pool;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(users).values(user).returning({ id: users.id });
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function seedAdminIfNeeded() {
  const db = await getDb();
  if (!db) return;
  
  try {
    const allUsers = await db.select().from(users).limit(10);
    if (allUsers.length === 0) return;
    
    const hasAdmin = allUsers.some(u => u.role === 'admin');
    if (!hasAdmin) {
      const firstUser = allUsers[0];
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, firstUser.id));
      console.log(`[Admin Seed] Promoted user ${firstUser.email} to admin role`);
    }
  } catch (error) {
    console.warn('[Admin Seed] Could not check/seed admin:', error);
  }
}

export async function seedDestinationsIfEmpty() {
  const db = await getDb();
  if (!db) return;
  
  try {
    const { destinations } = await import('../drizzle/schema');
    const existing = await db.select().from(destinations).limit(1);
    if (existing.length > 0) return;
    
    const initialDestinations = [
      {
        slug: 'riyadh',
        nameAr: 'الرياض',
        nameEn: 'Riyadh',
        titleAr: 'قلب المملكة النابض',
        titleEn: 'The Beating Heart of the Kingdom',
        descriptionAr: 'عاصمة تجمع بين التراث والحداثة مع أسواق عريقة ومتاحف وواجهات حديثة',
        descriptionEn: 'A capital that combines heritage and modernity with traditional markets, museums and modern facades',
        images: ['/images/cities/riyadh-hero.jpg'],
        isActive: true,
      },
      {
        slug: 'jeddah',
        nameAr: 'جدة',
        nameEn: 'Jeddah',
        titleAr: 'عروس البحر الأحمر',
        titleEn: 'Bride of the Red Sea',
        descriptionAr: 'مدينة ساحلية تاريخية تمزج بين الحضارة والبحر مع كورنيش خلاب وأسواق تقليدية',
        descriptionEn: 'A historic coastal city blending civilization and sea with a stunning corniche and traditional markets',
        images: ['/images/cities/jeddah-hero.jpg'],
        isActive: true,
      },
      {
        slug: 'taif',
        nameAr: 'الطائف',
        nameEn: 'Taif',
        titleAr: 'مصيف العرب',
        titleEn: 'Summer Resort of Arabia',
        descriptionAr: 'مدينة الورد والفواكه في أعالي جبال الحجاز',
        descriptionEn: 'City of roses and fruits in the highlands of Hijaz',
        images: ['/images/cities/taif-hero.jpg'],
        isActive: true,
      },
      {
        slug: 'abha',
        nameAr: 'أبها',
        nameEn: 'Abha',
        titleAr: 'سيدة الضباب',
        titleEn: 'Lady of the Fog',
        descriptionAr: 'مدينة جبلية باردة بطبيعة خلابة ومناظر ساحرة في قلب عسير',
        descriptionEn: 'A cool mountain city with stunning nature and charming views in the heart of Asir',
        images: ['/images/cities/abha-hero.jpg'],
        isActive: true,
      },
      {
        slug: 'alula',
        nameAr: 'العلا',
        nameEn: 'AlUla',
        titleAr: 'متحف في الهواء الطلق',
        titleEn: 'An Open-Air Museum',
        descriptionAr: 'واحة تاريخية بين الصخور الضخمة وآثار الحضارات القديمة',
        descriptionEn: 'A historical oasis among massive rocks and ancient civilization ruins',
        images: ['/images/cities/alula-hero.png'],
        isActive: true,
      },
    ];
    
    await db.insert(destinations).values(initialDestinations);
    console.log('[Seed] Inserted initial destinations');
  } catch (error) {
    console.warn('[Seed] Could not seed destinations:', error);
  }
}

export async function getAllDestinations() {
  const db = await getDb();
  if (!db) return [];
  const { destinations } = await import('../drizzle/schema');
  return db.select().from(destinations);
}

export async function getDestinationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { destinations } = await import('../drizzle/schema');
  const result = await db.select().from(destinations).where(eq(destinations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDestinationByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  const { destinations } = await import('../drizzle/schema');
  const { or } = await import('drizzle-orm');
  const result = await db.select().from(destinations)
    .where(or(eq(destinations.nameAr, name), eq(destinations.nameEn, name)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActivitiesByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import('../drizzle/schema');
  return db.select().from(activities).where(eq(activities.destinationId, destinationId));
}

export async function getAccommodationsByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { accommodations } = await import('../drizzle/schema');
  return db.select().from(accommodations).where(eq(accommodations.destinationId, destinationId));
}

export async function getRestaurantsByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { restaurants } = await import('../drizzle/schema');
  return db.select().from(restaurants).where(eq(restaurants.destinationId, destinationId));
}

export async function getUserTrips(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { trips } = await import('../drizzle/schema');
  return db.select().from(trips).where(eq(trips.userId, userId));
}

export async function createTrip(data: {
  userId: number;
  destinationId: number;
  days: number;
  budget: string;
  interests: string[];
  accommodationType?: string;
  plan: any;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  
  const result = await db.insert(trips).values(data).returning({ id: trips.id });
  return result[0];
}

export async function deleteTrip(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  const { and } = await import('drizzle-orm');
  
  await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    tier: users.tier,
    createdAt: users.createdAt,
  }).from(users);
}

export async function updateUserTier(userId: number, tier: 'free' | 'smart' | 'professional') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ tier }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function createDestination(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  const result = await db.insert(destinations).values(data).returning({ id: destinations.id });
  return result[0];
}

export async function updateDestination(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  await db.update(destinations).set(data).where(eq(destinations.id, id));
}

export async function deleteDestination(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  await db.delete(destinations).where(eq(destinations.id, id));
}

export async function getAllActivities() {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import('../drizzle/schema');
  return db.select().from(activities);
}

export async function createActivity(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  const result = await db.insert(activities).values(data).returning({ id: activities.id });
  return result[0];
}

export async function updateActivity(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  await db.update(activities).set(data).where(eq(activities.id, id));
}

export async function deleteActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  await db.delete(activities).where(eq(activities.id, id));
}

export async function deleteActivitiesByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  const result = await db.delete(activities).where(eq(activities.destinationId, destinationId));
  return result.rowCount || 0;
}

export async function deleteActivitiesMany(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  const result = await db.delete(activities).where(inArray(activities.id, ids));
  return result.rowCount || 0;
}

export async function getAllAccommodations() {
  const db = await getDb();
  if (!db) return [];
  const { accommodations } = await import('../drizzle/schema');
  return db.select().from(accommodations);
}

export async function createAccommodation(data: {
  destinationId: number;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  class: 'economy' | 'mid' | 'luxury';
  priceRange?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.insert(accommodations).values(data).returning({ id: accommodations.id });
  return result[0];
}

export async function updateAccommodation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  await db.update(accommodations).set({ ...data, updatedAt: new Date() }).where(eq(accommodations.id, id));
}

export async function deleteAccommodation(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  await db.delete(accommodations).where(eq(accommodations.id, id));
}

export async function deleteAccommodationsByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.delete(accommodations).where(eq(accommodations.destinationId, destinationId));
  return result.rowCount || 0;
}

export async function deleteAccommodationsMany(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.delete(accommodations).where(inArray(accommodations.id, ids));
  return result.rowCount || 0;
}

export async function getActivityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { activities } = await import('../drizzle/schema');
  const result = await db.select().from(activities).where(eq(activities.id, id));
  return result[0] || null;
}

export async function getAccommodationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.select().from(accommodations).where(eq(accommodations.id, id));
  return result[0] || null;
}

export async function getDestinationByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return null;
  const { destinations } = await import('../drizzle/schema');
  const result = await db.select().from(destinations).where(eq(destinations.externalId, externalId));
  return result[0] || null;
}

export async function getActivityByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return null;
  const { activities } = await import('../drizzle/schema');
  const result = await db.select().from(activities).where(eq(activities.externalId, externalId));
  return result[0] || null;
}

export async function getAccommodationByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return null;
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.select().from(accommodations).where(eq(accommodations.externalId, externalId));
  return result[0] || null;
}

export async function upsertDestinationByExternalId(externalId: string, data: {
  slug: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  isActive: boolean;
}): Promise<{ id: number }> {
  const pool = await getPool();
  if (!pool) throw new Error('Database not available');
  
  const result = await pool.query(`
    INSERT INTO destinations (external_id, slug, name_ar, name_en, title_ar, title_en, description_ar, description_en, images, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    ON CONFLICT (external_id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name_ar = EXCLUDED.name_ar,
      name_en = EXCLUDED.name_en,
      title_ar = EXCLUDED.title_ar,
      title_en = EXCLUDED.title_en,
      description_ar = EXCLUDED.description_ar,
      description_en = EXCLUDED.description_en,
      images = EXCLUDED.images,
      is_active = EXCLUDED.is_active,
      updated_at = NOW()
    RETURNING id
  `, [
    externalId,
    data.slug,
    data.nameAr,
    data.nameEn,
    data.titleAr,
    data.titleEn,
    data.descriptionAr,
    data.descriptionEn,
    JSON.stringify(data.images),
    data.isActive
  ]);
  
  return { id: result.rows[0].id };
}

export async function createDestinationWithExternalId(externalId: string, data: any) {
  return upsertDestinationByExternalId(externalId, {
    slug: data.slug || externalId.toLowerCase().replace(/\s+/g, '-'),
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    titleAr: data.titleAr,
    titleEn: data.titleEn,
    descriptionAr: data.descriptionAr || '',
    descriptionEn: data.descriptionEn || '',
    images: data.images || [],
    isActive: data.isActive !== false,
  });
}

export async function updateDestinationByExternalId(externalId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  await db.update(destinations).set({ ...data, updatedAt: new Date() }).where(eq(destinations.externalId, externalId));
}

export async function upsertActivityByExternalId(externalId: string, data: {
  destinationId: number;
  name: string;
  nameEn?: string;
  type: string;
  category?: string;
  tags?: string[];
  budgetLevel?: string;
  bestTimeOfDay?: string;
  duration?: string;
  details?: string;
  detailsEn?: string;
  googleMapsUrl?: string;
  minTier?: string;
  isActive?: boolean;
}): Promise<{ id: number }> {
  const pool = await getPool();
  if (!pool) throw new Error('Database not available');
  
  const result = await pool.query(`
    INSERT INTO activities (external_id, destination_id, name, name_en, type, category, tags, budget_level, best_time_of_day, duration, details, details_en, google_maps_url, min_tier, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
    ON CONFLICT (external_id) DO UPDATE SET
      destination_id = EXCLUDED.destination_id,
      name = EXCLUDED.name,
      name_en = EXCLUDED.name_en,
      type = EXCLUDED.type,
      category = EXCLUDED.category,
      tags = EXCLUDED.tags,
      budget_level = EXCLUDED.budget_level,
      best_time_of_day = EXCLUDED.best_time_of_day,
      duration = EXCLUDED.duration,
      details = EXCLUDED.details,
      details_en = EXCLUDED.details_en,
      google_maps_url = EXCLUDED.google_maps_url,
      min_tier = EXCLUDED.min_tier,
      is_active = EXCLUDED.is_active
    RETURNING id
  `, [
    externalId,
    data.destinationId,
    data.name,
    data.nameEn || null,
    data.type,
    data.category || null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.budgetLevel || null,
    data.bestTimeOfDay || null,
    data.duration || null,
    data.details || null,
    data.detailsEn || null,
    data.googleMapsUrl || null,
    data.minTier || 'free',
    data.isActive !== false
  ]);
  
  return { id: result.rows[0].id };
}

export async function createActivityWithExternalId(externalId: string, data: any) {
  return upsertActivityByExternalId(externalId, data);
}

export async function updateActivityByExternalId(externalId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  await db.update(activities).set(data).where(eq(activities.externalId, externalId));
}

export async function upsertAccommodationByExternalId(externalId: string, data: {
  destinationId: number;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  class: string;
  priceRange?: string;
  googleMapsUrl?: string;
  isActive?: boolean;
}): Promise<{ id: number }> {
  const pool = await getPool();
  if (!pool) throw new Error('Database not available');
  
  const result = await pool.query(`
    INSERT INTO accommodations (external_id, destination_id, name_ar, name_en, description_ar, description_en, class, price_range, google_maps_url, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    ON CONFLICT (external_id) DO UPDATE SET
      destination_id = EXCLUDED.destination_id,
      name_ar = EXCLUDED.name_ar,
      name_en = EXCLUDED.name_en,
      description_ar = EXCLUDED.description_ar,
      description_en = EXCLUDED.description_en,
      class = EXCLUDED.class,
      price_range = EXCLUDED.price_range,
      google_maps_url = EXCLUDED.google_maps_url,
      is_active = EXCLUDED.is_active,
      updated_at = NOW()
    RETURNING id
  `, [
    externalId,
    data.destinationId,
    data.nameAr,
    data.nameEn || null,
    data.descriptionAr || null,
    data.descriptionEn || null,
    data.class || 'mid',
    data.priceRange || null,
    data.googleMapsUrl || null,
    data.isActive !== false
  ]);
  
  return { id: result.rows[0].id };
}

export async function createAccommodationWithExternalId(externalId: string, data: any) {
  return upsertAccommodationByExternalId(externalId, data);
}

export async function updateAccommodationByExternalId(externalId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  await db.update(accommodations).set({ ...data, updatedAt: new Date() }).where(eq(accommodations.externalId, externalId));
}

export async function createDestinationWithId(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  const result = await db.insert(destinations).values({ id, ...data }).returning({ id: destinations.id });
  return result[0];
}

export async function createActivityWithId(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  const result = await db.insert(activities).values({ id, ...data }).returning({ id: activities.id });
  return result[0];
}

export async function createAccommodationWithId(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { accommodations } = await import('../drizzle/schema');
  const result = await db.insert(accommodations).values({ id, ...data }).returning({ id: accommodations.id });
  return result[0];
}

export async function getActivityByNameAndDestination(name: string, destinationId: number) {
  const db = await getDb();
  if (!db) return null;
  const { activities } = await import('../drizzle/schema');
  const { and } = await import('drizzle-orm');
  const result = await db.select().from(activities)
    .where(and(eq(activities.name, name), eq(activities.destinationId, destinationId)));
  return result[0] || null;
}

export async function getAccommodationByNameAndDestination(nameAr: string, destinationId: number) {
  const db = await getDb();
  if (!db) return null;
  const { accommodations } = await import('../drizzle/schema');
  const { and } = await import('drizzle-orm');
  const result = await db.select().from(accommodations)
    .where(and(eq(accommodations.nameAr, nameAr), eq(accommodations.destinationId, destinationId)));
  return result[0] || null;
}

export async function createSupportMessage(data: {
  userId?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { supportMessages } = await import('../drizzle/schema');
  const result = await db.insert(supportMessages).values(data).returning({ id: supportMessages.id });
  return result[0];
}

export async function getAllSupportMessages() {
  const db = await getDb();
  if (!db) return [];
  const { supportMessages } = await import('../drizzle/schema');
  const { desc } = await import('drizzle-orm');
  return db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
}

export async function markSupportMessageResolved(id: number, isResolved: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { supportMessages } = await import('../drizzle/schema');
  await db.update(supportMessages).set({ isResolved }).where(eq(supportMessages.id, id));
}

export async function deleteSupportMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { supportMessages } = await import('../drizzle/schema');
  await db.delete(supportMessages).where(eq(supportMessages.id, id));
}

export async function getTripById(tripId: number) {
  const db = await getDb();
  if (!db) return null;
  const { trips } = await import('../drizzle/schema');
  const result = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTripByShareToken(shareToken: string) {
  const db = await getDb();
  if (!db) return null;
  const { trips } = await import('../drizzle/schema');
  const result = await db.select().from(trips).where(eq(trips.shareToken, shareToken)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTripShareToken(tripId: number, shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  await db.update(trips).set({ shareToken, isPublic: true, updatedAt: new Date() }).where(eq(trips.id, tripId));
}

export async function removeTripShareToken(tripId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  await db.update(trips).set({ shareToken: null, isPublic: false, updatedAt: new Date() }).where(eq(trips.id, tripId));
}
