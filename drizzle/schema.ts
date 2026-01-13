import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with tier system for trip planning limits.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Hashed password
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tier: mysqlEnum("tier", ["free", "smart", "professional"]).default("free").notNull(),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Destinations/Cities table
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  images: json("images").$type<string[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

/**
 * Activities table
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  destinationId: int("destinationId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'ثقافة وتراث', 'تسوق وترفيه', etc.
  duration: varchar("duration", { length: 50 }),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  icon: varchar("icon", { length: 50 }),
  minTier: mysqlEnum("minTier", ["free", "smart", "professional"]).default("free").notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Accommodations table
 */
export const accommodations = mysqlTable("accommodations", {
  id: int("id").autoincrement().primaryKey(),
  destinationId: int("destinationId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["فاخر", "متوسط", "اقتصادي", "شقق مفروشة", "استراحات"]).notNull(),
  pricePerNight: decimal("pricePerNight", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  link: varchar("link", { length: 500 }),
  features: json("features").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = typeof accommodations.$inferInsert;

/**
 * Restaurants table
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  destinationId: int("destinationId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  cuisine: varchar("cuisine", { length: 100 }).notNull(),
  priceRange: mysqlEnum("priceRange", ["فاخر", "متوسط", "اقتصادي"]).notNull(),
  avgPrice: decimal("avgPrice", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  specialties: json("specialties").$type<string[]>(),
  trending: varchar("trending", { length: 200 }),
  location: varchar("location", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Trip plans table
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  destinationId: int("destinationId").notNull(),
  days: int("days").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  interests: json("interests").$type<string[]>().notNull(),
  accommodationType: varchar("accommodationType", { length: 50 }),
  plan: json("plan").$type<any>(), // Generated itinerary
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * User favorites table (for saved activities/destinations)
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["destination", "activity", "accommodation", "restaurant"]).notNull(),
  itemId: int("itemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
