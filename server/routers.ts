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

/**
 * Check if a time window is available (no overlap with existing activities)
 * Returns true if the proposed time block does not overlap with any scheduled activity
 */
function isTimeWindowAvailable(
  dayActivities: Array<any>,
  windowStartMinutes: number,
  windowEndMinutes: number
): boolean {
  return !dayActivities.some(act => {
    const actStart = parseInt(act.startTime.split(':')[0]) * 60 + parseInt(act.startTime.split(':')[1]);
    const actEnd = parseInt(act.endTime.split(':')[0]) * 60 + parseInt(act.endTime.split(':')[1]);
    
    // Check for overlap
    return !(windowEndMinutes <= actStart || windowStartMinutes >= actEnd);
  });
}

/**
 * Find an available time slot within a meal window that doesn't overlap with existing activities
 * Returns { startMinutes, endMinutes } or null if no slot available
 */
function findAvailableSlotInWindow(
  dayActivities: Array<any>,
  windowStartMinutes: number,
  windowEndMinutes: number,
  durationMinutes: number
): { startMinutes: number; endMinutes: number } | null {
  // Try the ideal window start time first
  if (isTimeWindowAvailable(dayActivities, windowStartMinutes, windowStartMinutes + durationMinutes)) {
    return { startMinutes: windowStartMinutes, endMinutes: windowStartMinutes + durationMinutes };
  }

  // Scan for available slots within the window (every 15 minutes)
  for (let tryStart = windowStartMinutes; tryStart + durationMinutes <= windowEndMinutes; tryStart += 15) {
    if (isTimeWindowAvailable(dayActivities, tryStart, tryStart + durationMinutes)) {
      return { startMinutes: tryStart, endMinutes: tryStart + durationMinutes };
    }
  }

  return null;
}

/**
 * Find an affordable restaurant matching a meal type
 * Prefers: type === 'restaurant' AND isActive
 * Prefers: mealType matches target OR mealType === 'any'
 */
function findAffordableRestaurant(
  candidates: Array<any>,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  maxCost: number,
  usedIds: Set<number>
): any | null {
  const restaurants = candidates.filter(
    act => act.type === 'restaurant' && act.isActive && !usedIds.has(act.id)
  );

  // Prefer exact meal type match
  let preferred = restaurants.filter(
    r => r.mealType === mealType || r.mealType === 'any' || !r.mealType
  );

  // If too few, relax to all restaurants
  if (preferred.length === 0) {
    preferred = restaurants;
  }

  // Pick first affordable restaurant
  for (const restaurant of preferred) {
    const estimatedCost = estimateCost(restaurant.cost, restaurant.budgetLevel);
    if (estimatedCost <= maxCost && estimatedCost > 0) {
      return restaurant;
    }
  }

  return null;
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

        // Select accommodation early to compute remaining budget
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
        
        // Calculate accommodation costs
        let accommodationMinPricePerNight: number | null = null;
        let accommodationAvgPricePerNight: number | null = null;
        
        if (selectedAccommodation) {
          const priceInfo = parsePriceRangeToMinMax(selectedAccommodation.priceRange || undefined);
          if (priceInfo.min !== undefined) {
            accommodationMinPricePerNight = priceInfo.min;
          }
          if (priceInfo.min !== undefined && priceInfo.max !== undefined) {
            accommodationAvgPricePerNight = Math.round((priceInfo.min + priceInfo.max) / 2);
          }
        }
        
        // Compute daily budget breakdown
        const accommodationCostPerNight = accommodationMinPricePerNight ?? 0;
        const remainingAfterAccommodation = Math.max(dailyBudget - accommodationCostPerNight, 0);

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

        // Apply budget-based activity filtering based on remaining budget after accommodation
        let budgetActivityNote: string | null = null;
        if (remainingAfterAccommodation < 150) {
          // Restrict activities based on remaining budget
          if (remainingAfterAccommodation < 50) {
            // Only allow free/low budget activities
            filteredActivities = filteredActivities.filter(activity => {
              const budgetLevel = activity.budgetLevel || 'medium';
              const cost = parseFloat(activity.cost || '0');
              return budgetLevel === 'low' || cost === 0;
            });
            budgetActivityNote = 'تم تقييد الأنشطة لتناسب المتبقي بعد السكن.';
          } else {
            // Allow low + medium, exclude high
            filteredActivities = filteredActivities.filter(activity => {
              const budgetLevel = activity.budgetLevel || 'medium';
              return budgetLevel !== 'high';
            });
            budgetActivityNote = 'تم تقييد الأنشطة لتناسب المتبقي بعد السكن.';
          }
        }

        // FINAL SAFETY BLOCK: If accommodation exhausted daily budget and no activities found, provide free alternatives
        if (remainingAfterAccommodation <= 0 && filteredActivities.length === 0) {
          // Try to find real free activities from the original DB list
          const freePool = activities.filter(activity => {
            const budgetLevel = activity.budgetLevel || 'medium';
            const cost = parseFloat(activity.cost || '0');
            const category = activity.category || '';
            
            return budgetLevel === 'low' || cost === 0 || ['طبيعة', 'تراث', 'ثقافة'].includes(category);
          });
          
          if (freePool.length > 0) {
            // Use real free activities
            filteredActivities = freePool;
          } else {
            // Create simple free placeholder activities
            const placeholders = [
              { nameAr: 'مشي حر في ممشى قريب', nameEn: 'Walk in nearby promenade', category: 'طبيعة' },
              { nameAr: 'زيارة حديقة عامة (مجاني)', nameEn: 'Visit public park (free)', category: 'طبيعة' },
              { nameAr: 'جولة تصوير خارجية لمعالم المدينة (مجاني)', nameEn: 'Free outdoor photography tour of landmarks', category: 'تراث' },
              { nameAr: 'استكشاف الأسواق التقليدية المحلية (مجاني)', nameEn: 'Explore local traditional markets (free)', category: 'ثقافة' },
              { nameAr: 'مشاهدة المناظر الطبيعية من نقطة ارتفاع (مجاني)', nameEn: 'View natural scenery from a viewpoint (free)', category: 'طبيعة' },
              { nameAr: 'زيارة مكتبة عامة أو متحف بدخول مجاني', nameEn: 'Visit free public library or museum', category: 'ثقافة' },
            ];
            
            placeholders.forEach((placeholder, idx) => {
              filteredActivities.push({
                id: -(1000 + idx),
                destinationId: input.destinationId,
                nameAr: placeholder.nameAr,
                nameEn: placeholder.nameEn,
                descriptionAr: `نشاط مجاني في ${destination.nameAr}`,
                descriptionEn: `Free activity in ${destination.nameEn}`,
                type: placeholder.category,
                category: placeholder.category,
                duration: '1 ساعة',
                cost: '0',
                budgetLevel: 'low',
                minTier: 'free',
                rating: 4,
                reviews: 50,
              } as any);
            });
          }
          
          budgetActivityNote = 'تمت إضافة أنشطة مجانية لأن ميزانية اليوم تذهب للسكن.';
        }

        const hadActivitiesBeforeBudgetFilter = filteredActivities.length > 0;

        // DETECT LOW-BUDGET MODE: If accommodation leaves little for activities
        // Calculate the minimum cost of a paid activity to detect low-budget threshold
        let cheapestPaidActivityCost = Infinity;
        for (const activity of filteredActivities) {
          const cost = estimateCost(activity.cost, activity.budgetLevel || undefined);
          if (cost > 0 && cost < cheapestPaidActivityCost) {
            cheapestPaidActivityCost = cost;
          }
        }
        // If no paid activities exist, use a reasonable default threshold (50 SAR)
        if (cheapestPaidActivityCost === Infinity) {
          cheapestPaidActivityCost = 50;
        }
        
        const isLowBudgetAfterStay = remainingAfterAccommodation < cheapestPaidActivityCost;

        // Fallback: generate placeholder activities if DB is empty
        if (filteredActivities.length === 0 && !hadActivitiesBeforeBudgetFilter) {
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
        // But if accommodation exhausted budget, limit to 1-2 free activities
        let minActivitiesPerDay = 3;
        let maxActivitiesPerDay = Math.max(minActivitiesPerDay, limits.maxActivitiesPerDay);
        
        if (remainingAfterAccommodation <= 0 && budgetActivityNote === 'تمت إضافة أنشطة مجانية لأن ميزانية اليوم تذهب للسكن.') {
          minActivitiesPerDay = 1;
          maxActivitiesPerDay = 2;
        }
        
        // Track used activities to avoid repetition
        const usedActivityIds = new Set<number>();
        
        // Helper to shuffle array
        const shuffleFn = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
        let allShuffled = shuffleFn(filteredActivities);

        // Rebuild the scheduler pool after all modifications to filteredActivities (including placeholders)
        allShuffled = shuffleFn(filteredActivities);
        
        // Pick next available activity (respecting low-budget mode if active)
        let currentDayIsLowBudget = false;
        const pickActivity = () => {
          // If in low-budget mode for this day, only pick free activities
          if (currentDayIsLowBudget) {
            const freeActivity = allShuffled.find(a => {
              if (usedActivityIds.has(a.id)) return false;
              const cost = estimateCost(a.cost, a.budgetLevel);
              return cost === 0; // Only free activities
            });
            if (freeActivity) usedActivityIds.add(freeActivity.id);
            return freeActivity;
          }
          
          // Normal mode: pick any available activity
          const activity = allShuffled.find(a => !usedActivityIds.has(a.id));
          if (activity) usedActivityIds.add(activity.id);
          return activity;
        };

        const plan = [];
        const travelBufferMinutes = 30; // Buffer between activities
        const dayStartTime = 9 * 60; // 09:00 in minutes since midnight
        const dayEndTimeMinutes = 23 * 60; // 23:00 (11 PM) - prevent scheduling past this time
let remainingTripBudget = input.budget;
        
        // Balanced activity distribution across days
        const totalActivitiesCount = filteredActivities.length;
        const baseActivitiesPerDay = Math.floor(totalActivitiesCount / input.days);
        let extraActivitiesDays = totalActivitiesCount % input.days;
        
        for (let day = 1; day <= input.days; day++) {
          const dayActivities = [];
          let currentTimeMinutes = dayStartTime;
          let activitiesCount = 0;
          let remainingActivityBudget = Math.max(dailyBudget - accommodationCostPerNight, 0);

          // ACTIVATE LOW-BUDGET MODE FOR THIS DAY if needed
          currentDayIsLowBudget = isLowBudgetAfterStay;

          // ZERO-BUDGET SAFETY: If accommodation exhausted budget, add 1-2 free activities directly
          if (remainingAfterAccommodation <= 0) {
            budgetActivityNote = 'تمت إضافة أنشطة مجانية لأن ميزانية اليوم تذهب للسكن.';
            
            const freeActivityNames = [
              'مشي حر في ممشى قريب',
              'زيارة حديقة عامة (مجاني)',
              'جولة تصوير خارجية (مجاني)',
              'استكشاف الأسواق التقليدية',
              'مشاهدة المناظر الطبيعية',
              'زيارة متحف بدخول مجاني',
            ];
            
            const freeActivityCategories = ['طبيعة', 'تراث', 'ثقافة'];
            const activitiesThisDay = Math.min(2, Math.max(1, Math.ceil(Math.random() * 2)));
            
            for (let i = 0; i < activitiesThisDay; i++) {
              const activity = freeActivityNames[(day - 1 + i) % freeActivityNames.length];
              const category = freeActivityCategories[i % freeActivityCategories.length];
              const durationMinutes = 60; // 1 hour
              const startTimeMinutes = currentTimeMinutes;
              const endTimeMinutes = startTimeMinutes + durationMinutes;
              
              if (endTimeMinutes > dayEndTimeMinutes) break;
              
              const startTime = minutesToTime(startTimeMinutes);
              const endTime = minutesToTime(endTimeMinutes);
              const period = derivePeriod(startTime);
              
              dayActivities.push({
                startTime,
                endTime,
                period,
                activity,
                description: `نشاط مجاني: ${activity}`,
                type: category,
                category,
                duration: '1 ساعة',
                cost: '0',
                budgetLevel: 'low',
                estimatedCost: 0,
              });
              
              currentTimeMinutes = endTimeMinutes + travelBufferMinutes;
            }
            
            // Skip normal scheduling for this day
            const dayTotalCost = 0;
            const remainingAfterActivities = Math.max(dailyBudget - accommodationCostPerNight, 0);
            const dayBudgetSummary = {
              dailyBudget,
              accommodationCostPerNight,
              remainingAfterAccommodation,
              activitiesCost: 0,
              remainingAfterActivities,
            };
            
            plan.push({
              day,
              title: dayTitles[day - 1],
              activities: dayActivities,
              dayTotalCost,
              dayBudgetSummary,
              budgetActivityNote,
            });
            
            continue; // Skip to next day
          }

          // Determine how many activities to schedule for this day
          let targetActivitiesCount = baseActivitiesPerDay;
          if (extraActivitiesDays > 0) {
            targetActivitiesCount += 1;
            extraActivitiesDays--;
          }
          targetActivitiesCount = Math.min(maxActivitiesPerDay, targetActivitiesCount);

          while (activitiesCount < targetActivitiesCount && usedActivityIds.size < filteredActivities.length) {
            const activity = pickActivity();
            if (!activity) break;

            // Compute activity cost
            let estimatedCost = estimateCost(activity.cost, activity.budgetLevel || undefined);

            // Apply smart fallback if estimatedCost is 0
            if (!estimatedCost || estimatedCost === 0) {
              const categoryFallback: { [key: string]: number } = {
                'مطاعم': 80,
                'ترفيه': 60,
                'تسوق': 100,
                'ثقافة': 30,
                'تراث': 20,
                'طبيعة': 10,
                'مغامرات': 120,
                'عائلي': 50,
              };
              const category = activity.category || activity.type || '';
              estimatedCost = categoryFallback[category] || 40;
            }

            // BUDGET ENFORCEMENT: Skip if activity cost exceeds remaining budget
            if (estimatedCost > remainingActivityBudget) {
              continue; // Try next activity instead of breaking early
            }

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

            // Add activity to day
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

            // Deduct cost from remaining budget
            remainingActivityBudget = Math.max(remainingActivityBudget - estimatedCost, 0);
            currentTimeMinutes = endTimeMinutes + travelBufferMinutes;
            activitiesCount++;
          }

// Ensure minimum activities (respecting budget constraints)

          while (
            dayActivities.length < minActivitiesPerDay &&
            usedActivityIds.size < filteredActivities.length
          ) {
            const activity = pickActivity();
            if (!activity) break;

            const durationMinutes = parseDurationToMinutes(activity.duration);
            const startTimeMinutes = currentTimeMinutes;
            const endTimeMinutes = startTimeMinutes + durationMinutes;

            if (endTimeMinutes > dayEndTimeMinutes) break;

            const startTime = minutesToTime(startTimeMinutes);
            const endTime = minutesToTime(endTimeMinutes);
            const period = derivePeriod(startTime);
            
            // Compute activity cost
            let estimatedCost = estimateCost(activity.cost, activity.budgetLevel || undefined);

            // Apply smart fallback if estimatedCost is 0
            if (!estimatedCost || estimatedCost === 0) {
              const categoryFallback: { [key: string]: number } = {
                'مطاعم': 80,
                'ترفيه': 60,
                'تسوق': 100,
                'ثقافة': 30,
                'تراث': 20,
                'طبيعة': 10,
                'مغامرات': 120,
                'عائلي': 50,
              };
              const category = activity.category || activity.type || '';
              estimatedCost = categoryFallback[category] || 40;
            }

            // BUDGET ENFORCEMENT: Skip if activity cost exceeds remaining budget
            if (estimatedCost > remainingActivityBudget) {
              continue; // Try next activity instead of breaking early
            }

            // Add activity to day
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

            // Deduct cost from remaining budget
            remainingActivityBudget = Math.max(remainingActivityBudget - estimatedCost, 0);
            currentTimeMinutes = endTimeMinutes + travelBufferMinutes;
          }

          // MEAL-AWARE RESTAURANT SCHEDULING
          // If user selected food interest, try to inject lunch and dinner restaurants
          // Skip restaurants if in low-budget mode (can't afford paid meals)
          const hasFood = input.interests.some(interest =>
            ['مطاعم', 'طعام', 'food'].includes(interest)
          );
          
          if (hasFood && restaurants.length > 0 && !currentDayIsLowBudget) {
            // Define meal windows (in minutes since midnight)
            const mealWindows = {
              lunch: { startMinutes: 12 * 60, endMinutes: 14 * 60, mealType: 'lunch' as const },
              dinner: { startMinutes: 18 * 60, endMinutes: 21 * 60, mealType: 'dinner' as const },
            };

            // Typical restaurant duration
            const restaurantDurationMinutes = 75; // 60-90 min average

            // Try to inject lunch restaurant
            const lunchSlot = findAvailableSlotInWindow(
              dayActivities,
              mealWindows.lunch.startMinutes,
              mealWindows.lunch.endMinutes,
              restaurantDurationMinutes
            );

            if (lunchSlot) {
              const lunchRestaurant = findAffordableRestaurant(
                restaurants,
                'lunch',
                remainingActivityBudget,
                usedActivityIds
              );

              if (lunchRestaurant) {
                const lunchCost = estimateCost(lunchRestaurant.cost, lunchRestaurant.budgetLevel);
                
                // Insert lunch restaurant
                dayActivities.push({
                  startTime: minutesToTime(lunchSlot.startMinutes),
                  endTime: minutesToTime(lunchSlot.endMinutes),
                  period: derivePeriod(minutesToTime(lunchSlot.startMinutes)),
                  activity: lunchRestaurant.name || lunchRestaurant.nameAr || 'مطعم الغداء',
                  description: lunchRestaurant.details || `استمتع بتناول الغداء في ${lunchRestaurant.name}`,
                  type: lunchRestaurant.type,
                  category: lunchRestaurant.category || 'مطاعم',
                  duration: '1.25 ساعة',
                  cost: lunchRestaurant.cost,
                  budgetLevel: lunchRestaurant.budgetLevel,
                  estimatedCost: lunchCost,
                  mealType: 'lunch',
                });

                usedActivityIds.add(lunchRestaurant.id);
                remainingActivityBudget = Math.max(remainingActivityBudget - lunchCost, 0);
              }
            }

            // Try to inject dinner restaurant
            const dinnerSlot = findAvailableSlotInWindow(
              dayActivities,
              mealWindows.dinner.startMinutes,
              mealWindows.dinner.endMinutes,
              restaurantDurationMinutes
            );

            if (dinnerSlot) {
              const dinnerRestaurant = findAffordableRestaurant(
                restaurants,
                'dinner',
                remainingActivityBudget,
                usedActivityIds
              );

              if (dinnerRestaurant) {
                const dinnerCost = estimateCost(dinnerRestaurant.cost, dinnerRestaurant.budgetLevel);
                
                // Insert dinner restaurant
                dayActivities.push({
                  startTime: minutesToTime(dinnerSlot.startMinutes),
                  endTime: minutesToTime(dinnerSlot.endMinutes),
                  period: derivePeriod(minutesToTime(dinnerSlot.startMinutes)),
                  activity: dinnerRestaurant.name || dinnerRestaurant.nameAr || 'مطعم العشاء',
                  description: dinnerRestaurant.details || `استمتع بتناول العشاء في ${dinnerRestaurant.name}`,
                  type: dinnerRestaurant.type,
                  category: dinnerRestaurant.category || 'مطاعم',
                  duration: '1.25 ساعة',
                  cost: dinnerRestaurant.cost,
                  budgetLevel: dinnerRestaurant.budgetLevel,
                  estimatedCost: dinnerCost,
                  mealType: 'dinner',
                });

                usedActivityIds.add(dinnerRestaurant.id);
                remainingActivityBudget = Math.max(remainingActivityBudget - dinnerCost, 0);
              }
            }

            // Re-sort dayActivities by time to maintain chronological order
            dayActivities.sort((a, b) => {
              const aTime = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
              const bTime = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
              return aTime - bTime;
            });
          }

          // Calculate daily budget summary based on actual scheduled activities
          const activitiesCost = dayActivities.reduce((sum, act) => sum + (act.estimatedCost || 0), 0);
          const remainingAfterActivitiesForDay = Math.max(dailyBudget - accommodationCostPerNight - activitiesCost, 0);
          
          // Update trip-level budget
          remainingTripBudget = Math.max(remainingTripBudget - accommodationCostPerNight - activitiesCost, 0);

          // Add day to plan
          plan.push({
            day,
            title: dayTitles[day - 1] || `اليوم ${day}`,
            activities: dayActivities,
            dayTotalCost: accommodationCostPerNight + activitiesCost,
            dayBudgetSummary: {
              dailyBudget,
              accommodationCostPerNight,
              remainingAfterAccommodation,
              activitiesCost,
              remainingAfterActivities: remainingAfterActivitiesForDay,
            },
            remainingTripBudget,
          });
        } 
        
        // Build accommodation info for plan (accommodation already selected and budgets computed earlier)
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
        
        // Determine budget note
        let budgetNote: string | null = null;
        if (remainingAfterAccommodation < 50) {
          budgetNote = 'ميزانيتك اليومية تذهب للسكن تقريبًا، تم تفضيل الأنشطة المجانية والخيارات الاقتصادية.';
        }
        
        // Calculate trip-level accommodation cost
        const accommodationTotalCost = (accommodationCostPerNight || 0) * input.days;
        
        // Calculate trip-level activities cost
        const activitiesTotalCost = plan.reduce((sum, day) => sum + (day.dayTotalCost || 0), 0);
        
        // Calculate total trip cost including accommodation and activities
        const tripTotalCost = accommodationTotalCost + activitiesTotalCost;
        
        // Calculate remaining budget after all expenses
        const remainingBudget = Math.max(input.budget - tripTotalCost, 0);
        
        // Keep plan as-is (dayBudgetSummary already set in the day loop)
        const planWithBudgetSummary = plan;

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
            dailyBudget,
            accommodationCostPerNight,
            remainingAfterAccommodation,
            budgetNote,
            budgetActivityNote,
            dailyPlan: planWithBudgetSummary,
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

      deleteByDestination: protectedProcedure
        .input(z.object({ destinationId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const count = await db.deleteActivitiesByDestination(input.destinationId);
          return { count };
        }),

      deleteMany: protectedProcedure
        .input(z.object({ ids: z.array(z.number()) }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const count = await db.deleteActivitiesMany(input.ids);
          return { count };
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

      deleteByDestination: protectedProcedure
        .input(z.object({ destinationId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const count = await db.deleteAccommodationsByDestination(input.destinationId);
          return { count };
        }),

      deleteMany: protectedProcedure
        .input(z.object({ ids: z.array(z.number()) }))
        .mutation(async ({ ctx, input }) => {
          const authHeader = ctx.req.headers.authorization;
          if (!authHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });
          
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = await db.getUserById(decoded.userId);
          
          if (!user || user.role !== 'admin') {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          
          const count = await db.deleteAccommodationsMany(input.ids);
          return { count };
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
        cities: z.array(z.record(z.string(), z.any())).optional(),
        activities: z.array(z.record(z.string(), z.any())).optional(),
        accommodations: z.array(z.record(z.string(), z.any())).optional(),
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

        // Helper: normalize header names
        const normalizeHeader = (header: string): string => {
          return header.trim().toLowerCase().replace(/[\s_-]/g, '');
        };

        // Helper: get field value by multiple possible header names
        const getFieldValue = (row: any, possibleHeaders: string[]): any => {
          for (const header of possibleHeaders) {
            const normalized = normalizeHeader(header);
            for (const [key, value] of Object.entries(row)) {
              if (normalizeHeader(key) === normalized) {
                return value;
              }
            }
          }
          return undefined;
        };

        // Helper: normalize budgetLevel enum (free -> low)
        const normalizeBudgetLevel = (value: any): string => {
          if (!value) return 'medium';
          const normalized = String(value).trim().toLowerCase();
          if (normalized === 'free') return 'low';
          if (['low', 'medium', 'high'].includes(normalized)) return normalized;
          return 'medium'; // default on unknown
        };

        // Helper: normalize minTier enum
        const normalizeMinTier = (value: any): string => {
          if (!value) return 'free';
          const normalized = String(value).trim().toLowerCase();
          if (['free', 'smart', 'professional'].includes(normalized)) return normalized;
          return 'free'; // default on unknown
        };

        // Helper: normalize bestTimeOfDay enum
        const normalizeBestTimeOfDay = (value: any): string => {
          if (!value) return '';
          const normalized = String(value).trim().toLowerCase();
          if (['morning', 'afternoon', 'evening', 'anytime'].includes(normalized)) return normalized;
          return ''; // default on unknown
        };

        // Helper: normalize accommodation class enum
        const normalizeAccommodationClass = (value: any): string => {
          if (!value) return 'mid';
          const normalized = String(value).trim().toLowerCase();
          if (['economy', 'mid', 'luxury'].includes(normalized)) return normalized;
          return 'mid'; // default on unknown
        };

        // Normalize city rows
        const normalizeCities = (cities: any[]): any[] => {
          return cities.map(city => ({
            cityKey: getFieldValue(city, ['city_id', 'cityKey', 'id']) || '',
            nameAr: getFieldValue(city, ['name_ar', 'nameAr']) || '',
            nameEn: getFieldValue(city, ['name_en', 'nameEn']) || '',
            descriptionAr: getFieldValue(city, ['description_ar', 'descriptionAr']) || '',
            descriptionEn: getFieldValue(city, ['description_en', 'descriptionEn']) || '',
            image: getFieldValue(city, ['image', 'image_url']) || '',
            region: getFieldValue(city, ['region']) || '',
            isActive: getFieldValue(city, ['is_active', 'isActive']) !== false,
          }));
        };

        // Normalize activity rows
        const normalizeActivities = (activities: any[]): any[] => {
          return activities.map(activity => ({
            activityKey: getFieldValue(activity, ['activity_id', 'id']) || '',
            destinationKey: getFieldValue(activity, ['city_id', 'destinationId']) || '',
            nameAr: getFieldValue(activity, ['name_ar', 'nameAr', 'name']) || '',
            nameEn: getFieldValue(activity, ['name_en', 'nameEn']) || '',
            type: getFieldValue(activity, ['type']) || '',
            category: getFieldValue(activity, ['category']) || '',
            budgetLevel: normalizeBudgetLevel(getFieldValue(activity, ['budget_level', 'budgetLevel'])),
            bestTimeOfDay: normalizeBestTimeOfDay(getFieldValue(activity, ['best_time_of_day', 'bestTimeOfDay', 'best_time'])),
            minTier: normalizeMinTier(getFieldValue(activity, ['min_tier', 'minTier'])),
            cost: getFieldValue(activity, ['cost', 'estimatedCost', 'avgCostPerPerson']) || '',
            duration: getFieldValue(activity, ['duration', 'durationMin']) || '',
            details: getFieldValue(activity, ['details', 'costNote']) || '',
            googleMapsUrl: getFieldValue(activity, ['google_maps_url', 'googleMapsUrl']) || '',
            isActive: getFieldValue(activity, ['is_active', 'isActive']) !== false,
            originalBudgetLevel: String(getFieldValue(activity, ['budget_level', 'budgetLevel']) || '').trim().toLowerCase(),
          }));
        };

        // Normalize accommodation rows
        const normalizeAccommodations = (accommodations: any[]): any[] => {
          return accommodations.map(acc => ({
            accommodationKey: getFieldValue(acc, ['accommodation_id', 'id']) || '',
            destinationKey: getFieldValue(acc, ['city_id', 'destinationId']) || '',
            nameAr: getFieldValue(acc, ['name_ar', 'nameAr']) || '',
            nameEn: getFieldValue(acc, ['name_en', 'nameEn']) || '',
            class: normalizeAccommodationClass(getFieldValue(acc, ['class'])),
            priceRange: getFieldValue(acc, ['price_range', 'priceRange', 'pricePerNight']) || '',
            descriptionAr: getFieldValue(acc, ['description_ar', 'descriptionAr']) || '',
            descriptionEn: getFieldValue(acc, ['description_en', 'descriptionEn']) || '',
            googleMapsUrl: getFieldValue(acc, ['google_maps_url', 'googleMapsUrl']) || '',
            rating: getFieldValue(acc, ['rating']) || '',
            isActive: getFieldValue(acc, ['is_active', 'isActive']) !== false,
          }));
        };

        const results: any = {};
        const cityKeyToDatabaseId: { [key: string]: number } = {};

        // Process Cities
        if (input.cities && input.cities.length > 0) {
          const normalizedCities = normalizeCities(input.cities);
          const errors: string[] = [];
          let upserted = 0;

          for (let idx = 0; idx < normalizedCities.length; idx++) {
            const city = normalizedCities[idx];
            if (!city.cityKey) {
              errors.push(`Row ${idx + 2}: مطلوب: cityKey (city_id OR cityKey OR id)`);
              continue;
            }
            if (!city.nameAr) {
              errors.push(`Row ${idx + 2}: مطلوب: nameAr (name_ar OR nameAr)`);
              continue;
            }

            const externalId = String(city.cityKey).trim();
            const cityData = {
              nameAr: city.nameAr,
              nameEn: city.nameEn || city.nameAr,
              slug: externalId.toLowerCase().replace(/\s+/g, '-'),
              titleAr: city.nameAr,
              titleEn: city.nameEn || city.nameAr,
              descriptionAr: city.descriptionAr || '',
              descriptionEn: city.descriptionEn || '',
              images: city.image ? [city.image] : [],
              isActive: city.isActive,
            };

            const result = await db.upsertDestinationByExternalId(externalId, cityData);
            cityKeyToDatabaseId[externalId] = result.id;
            upserted++;
          }

          results.cities = { upserted, errors: errors.length > 0 ? errors : undefined };
        }

        // Process Activities
        if (input.activities && input.activities.length > 0) {
          const normalizedActivities = normalizeActivities(input.activities);
          const errors: string[] = [];
          let upserted = 0;
          const missingDestinations: string[] = [];

          for (let idx = 0; idx < normalizedActivities.length; idx++) {
            const activity = normalizedActivities[idx];

            // Validate required fields
            if (!activity.destinationKey) {
              errors.push(`Row ${idx + 2}: مطلوب: destinationKey (city_id OR destinationId)`);
              continue;
            }
            if (!activity.nameAr) {
              errors.push(`Row ${idx + 2}: مطلوب: nameAr (name_ar OR nameAr OR name)`);
              continue;
            }
            if (!activity.type) {
              errors.push(`Row ${idx + 2}: مطلوب: type`);
              continue;
            }

            // Resolve destination
            let destinationId: number | null = null;

            // First check if we have a city key mapping from import
            const destKeyStr = String(activity.destinationKey).trim();
            if (cityKeyToDatabaseId[destKeyStr]) {
              destinationId = cityKeyToDatabaseId[destKeyStr];
            } else {
              // Try to find by external ID in DB
              const destination = await db.getDestinationByExternalId(destKeyStr);
              if (destination) {
                destinationId = destination.id;
              } else {
                // Try numeric lookup if it's a number
                if (!isNaN(Number(destKeyStr))) {
                  const numDestId = Number(destKeyStr);
                  try {
                    const destById = await db.getDestinationById(numDestId);
                    if (destById) destinationId = numDestId;
                  } catch (_e) {
                    // Destination not found
                  }
                }
              }
            }

            if (!destinationId) {
              if (!missingDestinations.includes(destKeyStr)) {
                missingDestinations.push(destKeyStr);
              }
              errors.push(`Row ${idx + 2}: destinationId/city_id "${destKeyStr}" not found in Cities sheet or database`);
              continue;
            }

            const activityKey = activity.activityKey || `activity_${Date.now()}_${idx}`;
            const tags = activity.category ? [activity.category] : [];

            // Handle "free" budgetLevel -> cost = 0
            let cost: string;
            if (activity.originalBudgetLevel === 'free') {
              cost = '0';
            } else if (activity.cost) {
              cost = String(activity.cost);
            } else {
              cost = '0';
            }

            const activityData = {
              destinationId,
              name: activity.nameAr,
              nameEn: activity.nameEn,
              type: activity.type || activity.category,
              category: activity.category as any,
              tags,
              details: activity.details,
              detailsEn: '',
              duration: activity.duration ? String(activity.duration) : undefined,
              cost,
              budgetLevel: activity.budgetLevel as any,
              bestTimeOfDay: activity.bestTimeOfDay as any,
              minTier: activity.minTier as any,
              isActive: activity.isActive,
              googleMapsUrl: activity.googleMapsUrl,
            };

            await db.upsertActivityByExternalId(String(activityKey), activityData);
            upserted++;
          }

          results.activities = { upserted, errors: errors.length > 0 ? errors : undefined, missingDestinations: missingDestinations.length > 0 ? missingDestinations : undefined };
        }

        // Process Accommodations
        if (input.accommodations && input.accommodations.length > 0) {
          const normalizedAccommodations = normalizeAccommodations(input.accommodations);
          const errors: string[] = [];
          let upserted = 0;
          const missingDestinations: string[] = [];

          for (let idx = 0; idx < normalizedAccommodations.length; idx++) {
            const acc = normalizedAccommodations[idx];

            // Validate required fields
            if (!acc.destinationKey) {
              errors.push(`Row ${idx + 2}: مطلوب: destinationKey (city_id OR destinationId)`);
              continue;
            }
            if (!acc.nameAr) {
              errors.push(`Row ${idx + 2}: مطلوب: nameAr (name_ar OR nameAr)`);
              continue;
            }
            if (!acc.class) {
              errors.push(`Row ${idx + 2}: مطلوب: class`);
              continue;
            }

            // Resolve destination
            let destinationId: number | null = null;

            const destKeyStr = String(acc.destinationKey).trim();
            if (cityKeyToDatabaseId[destKeyStr]) {
              destinationId = cityKeyToDatabaseId[destKeyStr];
            } else {
              const destination = await db.getDestinationByExternalId(destKeyStr);
              if (destination) {
                destinationId = destination.id;
              } else {
                if (!isNaN(Number(destKeyStr))) {
                  const numDestId = Number(destKeyStr);
                  try {
                    const destById = await db.getDestinationById(numDestId);
                    if (destById) destinationId = numDestId;
                  } catch (_e) {
                    // Destination not found
                  }
                }
              }
            }

            if (!destinationId) {
              if (!missingDestinations.includes(destKeyStr)) {
                missingDestinations.push(destKeyStr);
              }
              errors.push(`Row ${idx + 2}: destinationId/city_id "${destKeyStr}" not found in Cities sheet or database`);
              continue;
            }

            const accKey = acc.accommodationKey || `accommodation_${Date.now()}_${idx}`;

            const accData = {
              destinationId,
              nameAr: acc.nameAr,
              nameEn: acc.nameEn,
              descriptionAr: acc.descriptionAr,
              descriptionEn: acc.descriptionEn || '',
              class: (acc.class || 'mid') as any,
              priceRange: acc.priceRange,
              rating: acc.rating ? parseInt(String(acc.rating), 10) : undefined,
              googleMapsUrl: acc.googleMapsUrl,
              isActive: acc.isActive,
            };

            await db.upsertAccommodationByExternalId(String(accKey), accData);
            upserted++;
          }

          results.accommodations = { upserted, errors: errors.length > 0 ? errors : undefined, missingDestinations: missingDestinations.length > 0 ? missingDestinations : undefined };
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
