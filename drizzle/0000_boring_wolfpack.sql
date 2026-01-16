CREATE TYPE "public"."accommodation_type" AS ENUM('فاخر', 'متوسط', 'اقتصادي', 'شقق مفروشة', 'استراحات');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('destination', 'activity', 'accommodation', 'restaurant');--> statement-breakpoint
CREATE TYPE "public"."price_range" AS ENUM('فاخر', 'متوسط', 'اقتصادي');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('free', 'smart', 'professional');--> statement-breakpoint
CREATE TABLE "accommodations" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" "accommodation_type" NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"rating" numeric(2, 1),
	"link" varchar(500),
	"features" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_en" varchar(200),
	"type" varchar(100) NOT NULL,
	"duration" varchar(50),
	"cost" numeric(10, 2) DEFAULT '0',
	"icon" varchar(50),
	"min_tier" "tier" DEFAULT 'free' NOT NULL,
	"details" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"title_ar" varchar(200) NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"description_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"images" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_type" "item_type" NOT NULL,
	"item_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"cuisine" varchar(100) NOT NULL,
	"price_range" "price_range" NOT NULL,
	"avg_price" numeric(10, 2) NOT NULL,
	"rating" numeric(2, 1),
	"specialties" json,
	"trending" varchar(200),
	"location" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"destination_id" integer NOT NULL,
	"days" integer NOT NULL,
	"budget" numeric(10, 2) NOT NULL,
	"interests" json NOT NULL,
	"accommodation_type" varchar(50),
	"plan" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"tier" "tier" DEFAULT 'free' NOT NULL,
	"phone" varchar(20),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
