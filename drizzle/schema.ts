import { integer, pgEnum, pgTable, text, timestamp, varchar, json, decimal, boolean, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const tierEnum = pgEnum("tier", ["free", "smart", "professional"]);
export const accommodationTypeEnum = pgEnum("accommodation_type", ["فاخر", "متوسط", "اقتصادي", "شقق مفروشة", "استراحات"]);
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

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  type: varchar("type", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  icon: varchar("icon", { length: 50 }),
  minTier: tierEnum("min_tier").default("free").notNull(),
  details: text("details"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: accommodationTypeEnum("type").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  link: varchar("link", { length: 500 }),
  features: json("features").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
