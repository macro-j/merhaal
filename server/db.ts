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

// ============ ADMIN FUNCTIONS ============

// Users Admin
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

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Destinations Admin
export async function createDestination(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { destinations } = await import('../drizzle/schema');
  const result = await db.insert(destinations).values(data).$returningId();
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

export async function getActiveDestinations() {
  const db = await getDb();
  if (!db) return [];
  const { destinations } = await import('../drizzle/schema');
  return db.select().from(destinations).where(eq(destinations.isActive, true));
}

// Activities Admin
export async function createActivity(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { activities } = await import('../drizzle/schema');
  const result = await db.insert(activities).values(data).$returningId();
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

export async function getAllActivities() {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import('../drizzle/schema');
  return db.select().from(activities);
}

export async function getActiveActivitiesByDestination(destinationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import('../drizzle/schema');
  const { and } = await import('drizzle-orm');
  return db.select().from(activities).where(
    and(eq(activities.destinationId, destinationId), eq(activities.isActive, true))
  );
}

// Count user trips for tier limits
export async function countUserTrips(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { trips } = await import('../drizzle/schema');
  const { count } = await import('drizzle-orm');
  const result = await db.select({ count: count() }).from(trips).where(eq(trips.userId, userId));
  return result[0]?.count || 0;
}

// Get trip by ID
export async function getTripById(tripId: number) {
  const db = await getDb();
  if (!db) return null;
  const { trips } = await import('../drizzle/schema');
  const result = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Delete trip
export async function deleteTrip(tripId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { trips } = await import('../drizzle/schema');
  await db.delete(trips).where(eq(trips.id, tripId));
}
