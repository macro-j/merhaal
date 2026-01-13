import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
  
  const result = await db.insert(users).values(user).$returningId();
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

// Destinations
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

// Activities
export async function getActivitiesByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import('../drizzle/schema');
  return db.select().from(activities).where(eq(activities.destinationId, destinationId));
}

// Accommodations
export async function getAccommodationsByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { accommodations } = await import('../drizzle/schema');
  return db.select().from(accommodations).where(eq(accommodations.destinationId, destinationId));
}

// Restaurants
export async function getRestaurantsByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { restaurants } = await import('../drizzle/schema');
  return db.select().from(restaurants).where(eq(restaurants.destinationId, destinationId));
}

// Trips
export async function getUserTrips(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { trips } = await import('../drizzle/schema');
  return db.select().from(trips).where(eq(trips.userId, userId));
}

export async function createTrip(trip: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  const result = await db.insert(trips).values(trip).$returningId();
  return result[0];
}

export async function updateUserTier(userId: number, tier: 'free' | 'smart' | 'professional') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ tier }).where(eq(users.id, userId));
}
