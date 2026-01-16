import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

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
          },
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
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

        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
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
          professional: { maxDays: 999, maxTrips: 999, maxActivitiesPerDay: 10 },
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
          let budgetAllowed = true;
          if (qualityLevel === 'اقتصادية') {
            budgetAllowed = activityCost === 0;
          } else if (qualityLevel === 'متوسطة') {
            budgetAllowed = activityCost <= 100;
          }

          return tierAllowed && budgetAllowed;
        });

        // Filter by interests if provided
        if (input.interests.length > 0) {
          const interestFiltered = filteredActivities.filter(activity =>
            input.interests.some(interest => activity.type.includes(interest))
          );
          if (interestFiltered.length >= input.days * 2) {
            filteredActivities = interestFiltered;
          }
        }

        // Shuffle activities
        const shuffled = [...filteredActivities].sort(() => Math.random() - 0.5);

        // Generate daily plan
        const plan = [];
        const timeSlots = [
          { time: '09:00', period: 'صباحًا' },
          { time: '12:00', period: 'ظهرًا' },
          { time: '15:00', period: 'عصرًا' },
          { time: '18:00', period: 'مساءً' },
        ];
        const dayTitles = ['اليوم الأول', 'اليوم الثاني', 'اليوم الثالث', 'اليوم الرابع', 'اليوم الخامس', 'اليوم السادس', 'اليوم السابع', 'اليوم الثامن', 'اليوم التاسع', 'اليوم العاشر'];
        // Enforce tier-based activity limit per day
        const maxActivitiesPerDay = Math.min(limits.maxActivitiesPerDay, Math.ceil(shuffled.length / input.days), 4);

        for (let day = 1; day <= input.days; day++) {
          const dayActivities = [];
          const startIdx = (day - 1) * maxActivitiesPerDay;
          
          for (let i = 0; i < maxActivitiesPerDay && startIdx + i < shuffled.length; i++) {
            const activity = shuffled[startIdx + i];
            const slot = timeSlots[i] || timeSlots[0];
            dayActivities.push({
              time: slot.time,
              period: slot.period,
              activity: activity.name,
              description: activity.details || `استمتع بـ${activity.name} في ${destination.nameAr}`,
              type: activity.type,
              duration: activity.duration || '2 ساعة',
              cost: activity.cost,
            });
          }

          plan.push({
            day,
            title: dayTitles[day - 1] || `اليوم ${day}`,
            activities: dayActivities,
          });
        }

        // Select accommodation
        const accommodationType = input.accommodationType || 'متوسط';
        const selectedAccommodation = accommodations.find(a => a.type === accommodationType) || accommodations[0];

        // Create trip record
        const tripData = {
          userId: user.id,
          destinationId: input.destinationId,
          days: input.days,
          budget: input.budget.toString(),
          interests: input.interests,
          accommodationType: accommodationType,
          plan: {
            destination: destination.nameAr,
            days: input.days,
            budget: input.budget,
            budgetDistribution,
            qualityLevel,
            accommodation: selectedAccommodation ? {
              name: selectedAccommodation.name,
              type: selectedAccommodation.type,
              pricePerNight: selectedAccommodation.pricePerNight,
              features: selectedAccommodation.features,
            } : null,
            dailyPlan: plan,
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
  }),
});

export type AppRouter = typeof appRouter;
