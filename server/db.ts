import { eq } from "drizzle-orm";
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
        images: ['/images/cities/alula-hero.jpg'],
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
