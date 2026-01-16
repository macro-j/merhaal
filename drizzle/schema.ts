import { integer, pgEnum, pgTable, text, timestamp, varchar, json, decimal, boolean, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const tierEnum = pgEnum("tier", ["free", "smart", "professional"]);
export const accommodationTypeEnum = pgEnum("accommodation_type", ["فاخر", "متوسط", "اقتصادي", "شقق مفروشة", "استراحات"]);
export const accommodationClassEnum = pgEnum("accommodation_class", ["economy", "mid", "luxury"]);
export const priceRangeEnum = pgEnum("price_range", ["فاخر", "متوسط", "اقتصادي"]);
export const itemTypeEnum = pgEnum("item_type", ["destination", "activity", "accommodation", "restaurant"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  tier: tierEnum("tier").default("free").notNull(),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  titleAr: varchar("title_ar", { length: 200 }).notNull(),
  titleEn: varchar("title_en", { length: 200 }).notNull(),
  descriptionAr: text("description_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  images: json("images").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

export const categoryEnum = pgEnum("activity_category", ["مطاعم", "تراث", "طبيعة", "تسوق", "مغامرات", "عائلي", "ثقافة", "ترفيه"]);
export const budgetLevelEnum = pgEnum("budget_level", ["low", "medium", "high"]);
export const bestTimeEnum = pgEnum("best_time", ["morning", "afternoon", "evening", "anytime"]);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  type: varchar("type", { length: 100 }).notNull(),
  category: categoryEnum("category"),
  tags: json("tags").$type<string[]>(),
  budgetLevel: budgetLevelEnum("budget_level").default("medium"),
  bestTimeOfDay: bestTimeEnum("best_time_of_day").default("anytime"),
  duration: varchar("duration", { length: 50 }),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  icon: varchar("icon", { length: 50 }),
  minTier: tierEnum("min_tier").default("free").notNull(),
  details: text("details"),
  detailsEn: text("details_en"),
  googleMapsUrl: varchar("google_maps_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  class: accommodationClassEnum("class").default("mid").notNull(),
  priceRange: varchar("price_range", { length: 100 }),
  googlePlaceId: varchar("google_place_id", { length: 300 }),
  googleMapsUrl: varchar("google_maps_url", { length: 500 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = typeof accommodations.$inferInsert;

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  cuisine: varchar("cuisine", { length: 100 }).notNull(),
  priceRange: priceRangeEnum("price_range").notNull(),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  specialties: json("specialties").$type<string[]>(),
  trending: varchar("trending", { length: 200 }),
  location: varchar("location", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  destinationId: integer("destination_id").notNull(),
  days: integer("days").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  interests: json("interests").$type<string[]>().notNull(),
  accommodationType: varchar("accommodation_type", { length: 50 }),
  plan: json("plan").$type<any>(),
  shareToken: varchar("share_token", { length: 64 }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: integer("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;
