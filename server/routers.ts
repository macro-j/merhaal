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
            message: 'البريد الإلكتروني مسجل مسبقاً',
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
        const userTier = user.tier || 'free';
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
        const timeSlots = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];
        const maxActivitiesPerDay = Math.min(4, shuffled.length / input.days);

        for (let day = 1; day <= input.days; day++) {
          const dayActivities = [];
          const startIdx = (day - 1) * maxActivitiesPerDay;
          
          for (let i = 0; i < maxActivitiesPerDay && startIdx + i < shuffled.length; i++) {
            const activity = shuffled[startIdx + i];
            dayActivities.push({
              time: timeSlots[i] || '9:00 AM',
              activity: activity.name,
              type: activity.type,
              duration: activity.duration,
              cost: activity.cost,
              details: activity.details,
            });
          }

          plan.push({
            day,
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
});

export type AppRouter = typeof appRouter;
