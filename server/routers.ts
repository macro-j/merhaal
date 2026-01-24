import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

/**
 * Parse duration string to minutes
 * Supports formats: "2 ساعة", "90 دقيقة", "1.5 ساعة"
 * Defaults to 90 minutes if invalid or missing
 */
function parseDurationToMinutes(duration?: string): number {
  if (!duration || typeof duration !== 'string') return 90;

  const durationLower = duration.toLowerCase().trim();

  // Match "X ساعة" (hours in Arabic)
  const hoursMatch = durationLower.match(/^([\d.]+)\s*(?:ساعة|sa'ah|hour)/i);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    if (!isNaN(hours)) return Math.round(hours * 60);
  }

  // Match "X دقيقة" (minutes in Arabic)
  const minutesMatch = durationLower.match(/^([\d.]+)\s*(?:دقيقة|daqiqah|minute)/i);
  if (minutesMatch) {
    const minutes = parseFloat(minutesMatch[1]);
    if (!isNaN(minutes)) return Math.round(minutes);
  }

  return 90;
}

/**
 * Convert minutes since midnight to HH:MM format
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Derive period from time (HH:MM format)
 * صباحًا (morning): before 12:00
 * ظهرًا (afternoon): 12:00–16:00
 * مساءً (evening): after 16:00
 */
function derivePeriod(time: string): string {
  const [hoursStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);

  if (hours < 12) return 'صباحًا';
  if (hours < 16) return 'ظهرًا';
  return 'مساءً';
}

/**
 * Parse accommodation price range to min/max values
 * Supports formats: "1200–2500", "1200-2500", "1200"
 * Returns { min, max } or empty object if invalid/missing
 */
function parsePriceRangeToMinMax(priceRange?: string): { min?: number; max?: number } {
  if (!priceRange || typeof priceRange !== 'string') return {};

  const trimmed = priceRange.trim();

  // Try to match range: "1200–2500" or "1200-2500"
  const rangeMatch = trimmed.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return { min, max };
  }

  // Try to match single number
  const singleMatch = trimmed.match(/(\d+)/);
  if (singleMatch) {
    const price = parseInt(singleMatch[1], 10);
    return { min: price, max: price };
  }

  return {};
}

/**
 * Estimate activity cost from cost text or budget level
 * Supports formats: "150–400", "150-400", "150", or empty
 * If costText contains a range, returns average.
 * If empty, uses budgetLevel: low=25, medium=75, high=200
 * Special case: "0–400" (shopping) → moderate estimate (150) unless budgetLevel is low/high
 */
function estimateCost(costText?: string, budgetLevel?: string): number {
  // Fallback budget level values
  const budgetLevelDefaults: { [key: string]: number } = {
    low: 25,
    medium: 75,
    high: 200,
  };

  if (!costText || typeof costText !== 'string' || costText.trim() === '') {
    // Use budget level as fallback
    const level = (budgetLevel || 'medium').toLowerCase();
    return budgetLevelDefaults[level] || 75;
  }

  const trimmed = costText.trim();

  // Try to match range: "150–400" or "150-400"
  const rangeMatch = trimmed.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (rangeMatch) {
    const num1 = parseInt(rangeMatch[1], 10);
    const num2 = parseInt(rangeMatch[2], 10);
    
    // Special case: "0–X" might mean flexible/shopping → moderate estimate
    if (num1 === 0) {
      const level = (budgetLevel || 'medium').toLowerCase();
      if (level === 'low') return 25;
      if (level === 'high') return num2 * 0.5; // e.g., 0–400 → 200
      return 150; // moderate estimate for shopping
    }

    return Math.round((num1 + num2) / 2);
  }

  // Try to match single number
  const singleMatch = trimmed.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }

  // Fallback to budget level
  const level = (budgetLevel || 'medium').toLowerCase();
  return budgetLevelDefaults[level] || 75;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if user exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'البريد الإلكتروني مسجل مسبقًا',
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create user
        const result = await db.createUser({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          phone: input.phone || null,
          city: input.city || null,
          role: 'user',
          tier: 'free',
        });

        // Generate JWT
        const token = jwt.sign(
          { userId: result.id, email: input.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return {
          success: true,
          token,
          user: {
            id: result.id,
            name: input.name,
            email: input.email,
            role: 'user',
            tier: 'free',
            city: input.city || null,
          },
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
        rememberMe: z.boolean().optional().default(false),
      }))
      .mutation(async ({ input }) => {
        // Find user
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(input.password, user.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          });
        }

        // Update last sign in
        await db.updateUserLastSignIn(user.id);

        // Generate JWT with dynamic expiry based on rememberMe
        const tokenExpiry = input.rememberMe ? '30d' : '1d';
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: tokenExpiry }
        );

        return {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tier: user.tier,
            phone: user.phone,
            city: user.city,
          },
        };
      }),

    me: publicProcedure.query(async ({ ctx }) => {
      // Get token from header
      const authHeader = ctx.req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.tier,
          phone: user.phone,
          city: user.city,
        };
      } catch (error) {
        return null;
      }
    }),

    logout: publicProcedure.mutation(() => {
      return { success: true };
    }),
  }),

  destinations: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDestinations();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDestinationById(input.id);
      }),
    
    getByName: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        return await db.getDestinationByName(input.name);
      }),
    
    getActivities: publicProcedure
      .input(z.object({ destinationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActivitiesByDestination(input.destinationId);
      }),
    
    getAccommodations: publicProcedure
      .input(z.object({ destinationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccommodationsByDestination(input.destinationId);
      }),
    
    getRestaurants: publicProcedure
      .input(z.object({ destinationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRestaurantsByDestination(input.destinationId);
      }),
  }),

  trips: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Get user from token
      const authHeader = ctx.req.headers.authorization;
      if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      return await db.getUserTrips(decoded.userId);
    }),
    
    create: protectedProcedure
      .input(z.object({
        destinationId: z.number(),
        days: z.number().min(1),
        budget: z.number().min(0),
        interests: z.array(z.string()),
        accommodationType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get user from token
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

        // Check tier limits
        const userTier = user.tier || 'free';
        const tierLimits = {
          free: { maxDays: 1, maxTrips: 1, maxActivitiesPerDay: 3 },
          smart: { maxDays: 10, maxTrips: 3, maxActivitiesPerDay: 5 },
          professional: { maxDays: 999, maxTrips: 999, maxActivitiesPerDay: 8 },
        };
        const limits = tierLimits[userTier as keyof typeof tierLimits];

        // Check day limit
        if (input.days > limits.maxDays) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: `باقتك الحالية تسمح بـ ${limits.maxDays} أيام كحد أقصى. قم بترقية باقتك للمزيد!` 
          });
        }

        // Check trip count limit
        const existingTrips = await db.getUserTrips(decoded.userId);
        if (existingTrips.length >= limits.maxTrips) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: `باقتك الحالية تسمح بـ ${limits.maxTrips} رحلات محفوظة. قم بترقية باقتك أو احذف رحلة قديمة!` 
          });
        }

        // Generate trip plan
        const destination = await db.getDestinationById(input.destinationId);
        if (!destination) {
          throw new Error('Destination not found');
        }

        const activities = await db.getActivitiesByDestination(input.destinationId);
        const accommodations = await db.getAccommodationsByDestination(input.destinationId);
        const restaurants = await db.getRestaurantsByDestination(input.destinationId);

        // Budget distribution
        const dailyBudget = input.budget / input.days;
        const budgetDistribution = {
          accommodation: dailyBudget * 0.40,
          activities: dailyBudget * 0.35,
          food: dailyBudget * 0.25,
        };

        // Determine quality level
        let qualityLevel: 'اقتصادية' | 'متوسطة' | 'عالية';
        if (dailyBudget < 500) {
          qualityLevel = 'اقتصادية';
        } else if (dailyBudget < 1000) {
          qualityLevel = 'متوسطة';
        } else {
          qualityLevel = 'عالية';
        }

        // Filter activities by tier and budget
        let filteredActivities = activities.filter(activity => {
          const activityTier = activity.minTier || 'free';
          let tierAllowed = false;
          if (userTier === 'professional') tierAllowed = true;
          else if (userTier === 'smart' && (activityTier === 'free' || activityTier === 'smart')) tierAllowed = true;
          else if (userTier === 'free' && activityTier === 'free') tierAllowed = true;

          const activityCost = parseFloat(activity.cost || '0');
          const activityBudgetLevel = activity.budgetLevel || 'medium';
          let budgetAllowed = true;
          if (qualityLevel === 'اقتصادية') {
            budgetAllowed = activityCost === 0 || activityBudgetLevel === 'low';
          } else if (qualityLevel === 'متوسطة') {
            budgetAllowed = activityCost <= 100 || activityBudgetLevel !== 'high';
          }

          return tierAllowed && budgetAllowed;
        });

        // Filter by interests if provided (match against type, category, and tags)
        if (input.interests.length > 0) {
          const categoryMap: { [key: string]: string[] } = {
            'مطاعم': ['طعام', 'مطاعم', 'food'],
            'تسوق': ['تسوق', 'shopping'],
            'طبيعة': ['طبيعة', 'nature', 'منتزهات'],
            'ثقافة': ['ثقافة', 'culture', 'متاحف', 'تراث'],
            'مغامرات': ['مغامرات', 'adventure', 'رياضة'],
            'ترفيه': ['ترفيه', 'entertainment'],
            'عائلي': ['عائلي', 'family'],
          };
          
          const interestFiltered = filteredActivities.filter(activity => {
            const activityTags = activity.tags || [];
            return input.interests.some(interest => {
              const relatedTerms = categoryMap[interest] || [interest];
              return relatedTerms.some(term =>
                activity.type?.includes(term) ||
                activity.category?.includes(term) ||
                activityTags.some((tag: string) => tag.includes(term))
              );
            });
          });
          if (interestFiltered.length >= input.days * 2) {
            filteredActivities = interestFiltered;
          }
        }

        // Fallback: generate placeholder activities if DB is empty
        if (filteredActivities.length === 0) {
          const fallbackActivitiesPerDay = userTier === 'professional' ? 7 : userTier === 'smart' ? 4 : 2;
          const fallbackTemplates = [
            { name: `زيارة معالم ${destination.nameAr}`, type: 'سياحة', period: 'صباحًا' },
            { name: `جولة في أسواق ${destination.nameAr}`, type: 'تسوق', period: 'ظهرًا' },
            { name: `استكشاف المتاحف المحلية`, type: 'ثقافة', period: 'عصرًا' },
            { name: `تناول العشاء في مطعم محلي`, type: 'طعام', period: 'مساءً' },
            { name: `جولة مشي في الحي التاريخي`, type: 'سياحة', period: 'صباحًا' },
            { name: `زيارة الحدائق والمتنزهات`, type: 'طبيعة', period: 'ظهرًا' },
            { name: `تجربة المأكولات الشعبية`, type: 'طعام', period: 'عصرًا' },
            { name: `مشاهدة غروب الشمس`, type: 'طبيعة', period: 'مساءً' },
          ];
          
          for (let i = 0; i < input.days * fallbackActivitiesPerDay; i++) {
            const template = fallbackTemplates[i % fallbackTemplates.length];
            filteredActivities.push({
              id: -i,
              destinationId: input.destinationId,
              name: template.name,
              type: template.type,
              details: `استمتع بتجربة فريدة في ${destination.nameAr}`,
              duration: '2 ساعة',
              cost: '0',
              minTier: 'free',
            } as any);
          }
        }

        // Dynamic time-aware scheduling
        const dayTitles = ['اليوم الأول', 'اليوم الثاني', 'اليوم الثالث', 'اليوم الرابع', 'اليوم الخامس', 'اليوم السادس', 'اليوم السابع', 'اليوم الثامن', 'اليوم التاسع', 'اليوم العاشر'];
        
        // Enforce tier-based activity limit per day (minimum 3, maximum based on tier)
        const minActivitiesPerDay = 3;
        const maxActivitiesPerDay = Math.max(minActivitiesPerDay, limits.maxActivitiesPerDay);
        
        // Track used activities to avoid repetition
        const usedActivityIds = new Set<number>();
        
        // Helper to shuffle array
        const shuffleFn = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
        const allShuffled = shuffleFn(filteredActivities);
        
        // Pick next available activity
        const pickActivity = () => {
          const activity = allShuffled.find(a => !usedActivityIds.has(a.id));
          if (activity) usedActivityIds.add(activity.id);
          return activity;
        };

        const plan = [];
        const travelBufferMinutes = 30; // Buffer between activities
        const dayStartTime = 9 * 60; // 09:00 in minutes since midnight
        const dayEndTimeMinutes = 23 * 60; // 23:00 (11 PM) - prevent scheduling past this time

        for (let day = 1; day <= input.days; day++) {
          const dayActivities = [];
          let currentTimeMinutes = dayStartTime;
          let activitiesCount = 0;

          // Determine how many activities to schedule for this day
          const targetActivitiesCount = Math.min(maxActivitiesPerDay, 
            Math.ceil(filteredActivities.length / input.days) + 1);

          while (activitiesCount < targetActivitiesCount && usedActivityIds.size < filteredActivities.length) {
            const activity = pickActivity();
            if (!activity) break;

            // Parse activity duration
            const durationMinutes = parseDurationToMinutes(activity.duration);

            // Calculate times
            const startTimeMinutes = currentTimeMinutes;
            const endTimeMinutes = startTimeMinutes + durationMinutes;

            // Prevent scheduling past 23:00 (day end cutoff)
            if (endTimeMinutes > dayEndTimeMinutes) break;

            const startTime = minutesToTime(startTimeMinutes);
            const endTime = minutesToTime(endTimeMinutes);
            const period = derivePeriod(startTime);
            const estimatedCost = estimateCost(activity.cost, activity.budgetLevel);

            dayActivities.push({
              startTime,
              endTime,
              period,
              activity: activity.name,
              description: activity.details || `استمتع بـ${activity.name} في ${destination.nameAr}`,
              type: activity.type,
              category: activity.category,
              duration: activity.duration || '2 ساعة',
              cost: activity.cost,
              budgetLevel: activity.budgetLevel,
              estimatedCost,
            });

            // Move to next activity time slot (add travel buffer)
            currentTimeMinutes = endTimeMinutes + travelBufferMinutes;
            activitiesCount++;
          }

          // Ensure minimum activities per day
          while (dayActivities.length < minActivitiesPerDay && usedActivityIds.size < filteredActivities.length) {
            const activity = pickActivity();
            if (!activity) break;

            const durationMinutes = parseDurationToMinutes(activity.duration);
            const startTimeMinutes = currentTimeMinutes;
            const endTimeMinutes = startTimeMinutes + durationMinutes;

            // Prevent scheduling past 23:00 (day end cutoff)
            if (endTimeMinutes > dayEndTimeMinutes) break;

            const startTime = minutesToTime(startTimeMinutes);
            const endTime = minutesToTime(endTimeMinutes);
            const period = derivePeriod(startTime);
            const estimatedCost = estimateCost(activity.cost, activity.budgetLevel);

            dayActivities.push({
              startTime,
              endTime,
              period,
              activity: activity.name,
              description: activity.details || `استمتع بـ${activity.name} في ${destination.nameAr}`,
              type: activity.type,
              category: activity.category,
              duration: activity.duration || '2 ساعة',
              cost: activity.cost,
              budgetLevel: activity.budgetLevel,
              estimatedCost,
            });

            currentTimeMinutes = endTimeMinutes + travelBufferMinutes;
          }

          // Calculate day total cost
          const dayTotalCost = dayActivities.reduce((sum, act) => sum + (act.estimatedCost || 0), 0);

          plan.push({
            day,
            title: dayTitles[day - 1] || `اليوم ${day}`,
            activities: dayActivities,
            dayTotalCost,
          });
        }

        // Select accommodation by class matching with budget-aware fallback
        const preferredClass = input.accommodationType === 'فاخر' ? 'luxury' : 
                              input.accommodationType === 'اقتصادي' ? 'economy' : 'mid';
        
        // Try classes in fallback order: luxury -> mid -> economy
        const classOrderByPreference: Array<'luxury' | 'mid' | 'economy'> = ['luxury', 'mid', 'economy'];
        const preferredIndex = classOrderByPreference.indexOf(preferredClass);
        const orderedClasses = classOrderByPreference.slice(preferredIndex).concat(classOrderByPreference.slice(0, preferredIndex));
        
        let selectedAccommodation: any = null;
        let accommodationSelectionNote: string | null = null;
        
        // Try each class in order, checking affordability
        for (const classToTry of orderedClasses) {
          const candidateAccommodations = accommodations.filter(a => a.class === classToTry && a.isActive);
          
          for (const accommodation of candidateAccommodations) {
            const priceInfo = parsePriceRangeToMinMax(accommodation.priceRange || undefined);
            
            // If we have price info, check if minimum price is within daily budget
            if (priceInfo.min !== undefined) {
              if (priceInfo.min > dailyBudget) {
                // This accommodation is too expensive, skip it
                continue;
              }
            }
            
            // Found an affordable accommodation
            selectedAccommodation = accommodation;
            
            // Generate selection note if we fell back to a cheaper class
            if (classToTry !== preferredClass) {
              const classLabels: { [key: string]: string } = {
                'luxury': 'فاخرة',
                'mid': 'متوسطة',
                'economy': 'اقتصادية',
              };
              const preferredLabel = classLabels[preferredClass];
              const selectedLabel = classLabels[classToTry];
              accommodationSelectionNote = `تم اختيار إقامة ${selectedLabel} لأن الميزانية اليومية (${dailyBudget} ر.س) لا تناسب إقامة ${preferredLabel}.`;
            }
            
            break;
          }
          
          if (selectedAccommodation) break;
        }
        
        // Build accommodation info for plan
        let accommodationInfo = null;
        if (selectedAccommodation) {
          accommodationInfo = {
            name: selectedAccommodation.nameAr,
            nameEn: selectedAccommodation.nameEn,
            class: selectedAccommodation.class,
            priceRange: selectedAccommodation.priceRange,
            googleMapsUrl: selectedAccommodation.googleMapsUrl || selectedAccommodation.googlePlaceId 
              ? `https://www.google.com/maps/place/?q=place_id:${selectedAccommodation.googlePlaceId}` 
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAccommodation.nameAr + ' ' + destination.nameAr + ' السعودية')}`,
            rating: selectedAccommodation.rating,
          };
        }

        // Calculate trip total cost and remaining budget
        const tripTotalCost = plan.reduce((sum, day) => sum + (day.dayTotalCost || 0), 0);
        const remainingBudget = input.budget - tripTotalCost;

        // Create trip record
        const tripData = {
          userId: user.id,
          destinationId: input.destinationId,
          days: input.days,
          budget: input.budget.toString(),
          interests: input.interests,
          accommodationType: input.accommodationType || 'متوسط',
          plan: {
            destination: destination.nameAr,
            days: input.days,
            budget: input.budget,
            budgetDistribution,
            qualityLevel,
            accommodation: accommodationInfo,
            accommodationSelectionNote,
            noAccommodationMessage: !selectedAccommodation ? 'لا توجد إقامات تناسب ميزانيتك في هذه المدينة' : null,
            dailyPlan: plan,
            tripTotalCost,
            remainingBudget,
          },
        };

        const result = await db.createTrip(tripData);
        return { id: result.id, plan: tripData.plan };
      }),

    delete: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        await db.deleteTrip(input.tripId, decoded.userId);
        return { success: true };
      }),

    generateShareLink: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        if (user.tier !== 'smart' && user.tier !== 'professional') {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'مشاركة الخطط متاحة فقط لباقة ذكي والاحترافي' 
          });
        }
        
        const trips = await db.getUserTrips(decoded.userId);
        const trip = trips.find((t: any) => t.id === input.tripId);
        if (!trip) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الخطة غير موجودة' });
        }
        
        const shareToken = crypto.randomBytes(32).toString('hex');
        await db.updateTripShareToken(input.tripId, shareToken);
        
        return { shareToken };
      }),

    removeShareLink: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        const trips = await db.getUserTrips(decoded.userId);
        const trip = trips.find((t: any) => t.id === input.tripId);
        if (!trip) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الخطة غير موجودة' });
        }
        
        await db.removeTripShareToken(input.tripId);
        return { success: true };
      }),

    getShared: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        const trip = await db.getTripByShareToken(input.shareToken);
        if (!trip || !trip.isPublic) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الخطة غير موجودة أو غير متاحة للمشاركة' });
        }
        
        const destination = await db.getDestinationById(trip.destinationId);
        return {
          id: trip.id,
          days: trip.days,
          destination: destination?.nameAr || 'غير معروف',
          plan: trip.plan,
          createdAt: trip.createdAt,
        };
      }),
  }),

  user: router({
    updateTier: protectedProcedure
      .input(z.object({
        tier: z.enum(['free', 'smart', 'professional']),
      }))
      .mutation(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        await db.updateUserTier(decoded.userId, input.tier);
        return { success: true };
      }),
  }),

  admin: router({
    checkAccess: protectedProcedure.query(async ({ ctx }) => {
      const authHeader = ctx.req.headers.authorization;
      if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await db.getUserById(decoded.userId);
      
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      
      return { isAdmin: true };
    }),

    users: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getAllUsers();
      }),

      updateTier: protectedProcedure
        .input(z.object({
          userId: z.number(),
          tier: z.enum(['free', 'smart', 'professional']),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.updateUserTier(input.userId, input.tier);
          return { success: true };
        }),

      updateRole: protectedProcedure
        .input(z.object({
          userId: z.number(),
          role: z.enum(['user', 'admin']),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.updateUserRole(input.userId, input.role);
          return { success: true };
        }),
    }),

    destinations: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getAllDestinations();
      }),

      create: protectedProcedure
        .input(z.object({
          slug: z.string().min(2),
          nameAr: z.string().min(2),
          nameEn: z.string().min(2),
          titleAr: z.string().min(2),
          titleEn: z.string().min(2),
          descriptionAr: z.string().min(10),
          descriptionEn: z.string().min(10),
          images: z.array(z.string()),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const result = await db.createDestination(input);
          return { id: result.id };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          slug: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          titleAr: z.string().optional(),
          titleEn: z.string().optional(),
          descriptionAr: z.string().optional(),
          descriptionEn: z.string().optional(),
          images: z.array(z.string()).optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const { id, ...data } = input;
          await db.updateDestination(id, data);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.deleteDestination(input.id);
          return { success: true };
        }),
    }),

    activities: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getAllActivities();
      }),

      create: protectedProcedure
        .input(z.object({
          destinationId: z.number(),
          name: z.string().min(2),
          nameEn: z.string().optional(),
          type: z.string().min(2),
          duration: z.string().optional(),
          cost: z.string().optional(),
          icon: z.string().optional(),
          minTier: z.enum(['free', 'smart', 'professional']).default('free'),
          details: z.string().optional(),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const result = await db.createActivity(input);
          return { id: result.id };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          destinationId: z.number().optional(),
          name: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.string().optional(),
          duration: z.string().optional(),
          cost: z.string().optional(),
          icon: z.string().optional(),
          minTier: z.enum(['free', 'smart', 'professional']).optional(),
          details: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const { id, ...data } = input;
          await db.updateActivity(id, data);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.deleteActivity(input.id);
          return { success: true };
        }),
    }),

    accommodations: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getAllAccommodations();
      }),

      create: protectedProcedure
        .input(z.object({
          destinationId: z.number(),
          nameAr: z.string().min(2),
          nameEn: z.string().optional(),
          descriptionAr: z.string().optional(),
          descriptionEn: z.string().optional(),
          class: z.enum(['economy', 'mid', 'luxury']).default('mid'),
          priceRange: z.string().optional(),
          googlePlaceId: z.string().optional(),
          googleMapsUrl: z.string().optional(),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const result = await db.createAccommodation(input);
          return { id: result.id };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          destinationId: z.number().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          descriptionAr: z.string().optional(),
          descriptionEn: z.string().optional(),
          class: z.enum(['economy', 'mid', 'luxury']).optional(),
          priceRange: z.string().optional(),
          googlePlaceId: z.string().optional(),
          googleMapsUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const { id, ...data } = input;
          await db.updateAccommodation(id, data);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.deleteAccommodation(input.id);
          return { success: true };
        }),
    }),

    support: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getAllSupportMessages();
      }),

      markResolved: protectedProcedure
        .input(z.object({ id: z.number(), isResolved: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.markSupportMessageResolved(input.id, input.isResolved);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          await db.deleteSupportMessage(input.id);
          return { success: true };
        }),
    }),

    bulkImport: protectedProcedure
      .input(z.object({
        cities: z.array(z.object({
          city_id: z.string(),
          name_ar: z.string(),
          name_en: z.string().optional(),
          description_ar: z.string().optional(),
          description_en: z.string().optional(),
          image_url: z.string().optional(),
          is_active: z.boolean().optional(),
        })).optional(),
        activities: z.array(z.object({
          activity_id: z.string(),
          city_id: z.string(),
          name_ar: z.string(),
          name_en: z.string().optional(),
          description_ar: z.string().optional(),
          category: z.string(),
          tags: z.union([z.array(z.string()), z.string()]).optional(),
          budget_level: z.string().optional(),
          best_time: z.string().optional(),
          duration_min: z.number().optional(),
          is_indoor: z.boolean().optional(),
          is_unique: z.boolean().optional(),
          google_maps_url: z.string().optional(),
          tier_required: z.string().optional(),
          is_active: z.boolean().optional(),
        })).optional(),
        accommodations: z.array(z.object({
          accommodation_id: z.string(),
          city_id: z.string(),
          name_ar: z.string(),
          name_en: z.string().optional(),
          class: z.string(),
          price_range: z.string().optional(),
          description_ar: z.string().optional(),
          google_maps_url: z.string().optional(),
          tier_required: z.string().optional(),
          is_active: z.boolean().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await db.getUserById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const results: any = {};

        if (input.cities && input.cities.length > 0) {
          let upserted = 0;
          for (const city of input.cities) {
            const externalId = String(city.city_id).trim();
            const cityData = {
              nameAr: city.name_ar,
              nameEn: city.name_en || city.name_ar,
              slug: externalId.toLowerCase().replace(/\s+/g, '-'),
              titleAr: city.name_ar,
              titleEn: city.name_en || city.name_ar,
              descriptionAr: city.description_ar || '',
              descriptionEn: city.description_en || '',
              images: city.image_url ? [city.image_url] : [],
              isActive: city.is_active !== false,
            };
            await db.upsertDestinationByExternalId(externalId, cityData);
            upserted++;
          }
          results.cities = { upserted };
        }

        if (input.activities && input.activities.length > 0) {
          let upserted = 0;
          const missingCities: string[] = [];
          for (const activity of input.activities) {
            const externalId = String(activity.activity_id).trim();
            const cityExternalId = String(activity.city_id).trim();
            const destination = await db.getDestinationByExternalId(cityExternalId);
            if (!destination) {
              if (!missingCities.includes(cityExternalId)) {
                missingCities.push(cityExternalId);
              }
              continue;
            }
            const tags = Array.isArray(activity.tags) ? activity.tags : 
                        (typeof activity.tags === 'string' ? activity.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
            const activityData = {
              destinationId: destination.id,
              name: activity.name_ar,
              nameEn: activity.name_en,
              type: activity.category,
              category: activity.category as any,
              tags,
              details: activity.description_ar,
              detailsEn: '',
              duration: activity.duration_min ? `${activity.duration_min} دقيقة` : undefined,
              budgetLevel: activity.budget_level as any,
              bestTimeOfDay: activity.best_time as any,
              minTier: (activity.tier_required || 'free') as any,
              isActive: activity.is_active !== false,
              googleMapsUrl: activity.google_maps_url,
            };
            await db.upsertActivityByExternalId(externalId, activityData);
            upserted++;
          }
          results.activities = { upserted, missingCities };
        }

        if (input.accommodations && input.accommodations.length > 0) {
          let upserted = 0;
          const missingCities: string[] = [];
          for (const acc of input.accommodations) {
            const externalId = String(acc.accommodation_id).trim();
            const cityExternalId = String(acc.city_id).trim();
            const destination = await db.getDestinationByExternalId(cityExternalId);
            if (!destination) {
              if (!missingCities.includes(cityExternalId)) {
                missingCities.push(cityExternalId);
              }
              continue;
            }
            const accData = {
              destinationId: destination.id,
              nameAr: acc.name_ar,
              nameEn: acc.name_en,
              descriptionAr: acc.description_ar,
              descriptionEn: '',
              class: (acc.class || 'mid') as any,
              priceRange: acc.price_range,
              googleMapsUrl: acc.google_maps_url,
              isActive: acc.is_active !== false,
            };
            await db.upsertAccommodationByExternalId(externalId, accData);
            upserted++;
          }
          results.accommodations = { upserted, missingCities };
        }

        return results;
      }),
  }),

  support: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(2),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createSupportMessage(input);
        return { id: result.id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
