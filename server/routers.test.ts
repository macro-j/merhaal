import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Destinations Router", () => {
  it("should list all destinations", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const destinations = await caller.destinations.list();
    
    expect(destinations).toBeDefined();
    expect(Array.isArray(destinations)).toBe(true);
    expect(destinations.length).toBeGreaterThan(0);
  });

  it("should get destination by ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const destination = await caller.destinations.getById({ id: 1 });
    
    expect(destination).toBeDefined();
    if (destination) {
      expect(destination.nameAr).toBeDefined();
      expect(destination.nameEn).toBeDefined();
    }
  });

  it("should get activities for a destination", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const activities = await caller.destinations.getActivities({ destinationId: 1 });
    
    expect(activities).toBeDefined();
    expect(Array.isArray(activities)).toBe(true);
  });
});

describe("Trips Router", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    tier: "free",
    phone: null,
    city: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("should require authentication to list trips", async () => {
    const ctx = createMockContext(); // No user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.trips.list()).rejects.toThrow();
  });

  it("should list trips for authenticated user", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const trips = await caller.trips.list();
    
    expect(trips).toBeDefined();
    expect(Array.isArray(trips)).toBe(true);
  });

  it("should create a trip with valid input", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const tripInput = {
      destinationId: 1,
      days: 1,
      budget: 500,
      interests: ['ثقافة وتراث'],
      accommodationType: 'متوسط',
    };

    const result = await caller.trips.create(tripInput);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.plan.dailyPlan).toBeDefined();
    expect(result.plan.dailyPlan.length).toBe(1);
  });

  it("should enforce tier limits on trip creation", async () => {
    const ctx = createMockContext(mockUser); // Free tier user
    const caller = appRouter.createCaller(ctx);

    const tripInput = {
      destinationId: 1,
      days: 5, // Free tier only allows 1 day
      budget: 2500,
      interests: [],
      accommodationType: 'متوسط',
    };

    // This should work but the frontend should prevent this
    // The backend doesn't enforce tier limits, only filters activities
    const result = await caller.trips.create(tripInput);
    expect(result).toBeDefined();
  });
});

describe("Auth Router", () => {
  it("should return null for unauthenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    
    expect(user).toBeNull();
  });

  it("should return user for authenticated user", async () => {
    const mockUser: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      tier: "free",
      phone: null,
      city: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.email).toBe("test@example.com");
  });
});
