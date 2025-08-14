import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  },
  returns: v.id("screenings"),
  handler: async (ctx, args) => {
    const screeningId = await ctx.db.insert("screenings", args);
    return screeningId;
  },
});

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("screenings"),
    _creationTime: v.number(),
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const screenings = await ctx.db.query("screenings").order("desc").collect();
    return screenings;
  },
});

export const listByMovie = query({
  args: { movieId: v.id("movies") },
  returns: v.array(v.object({
    _id: v.id("screenings"),
    _creationTime: v.number(),
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const screenings = await ctx.db
      .query("screenings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
    return screenings;
  },
});

export const listUpcoming = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("screenings"),
    _creationTime: v.number(),
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const screenings = await ctx.db
      .query("screenings")
      .withIndex("by_date", (q) => q.gte("date", today))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return screenings;
  },
});

export const listPast = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("screenings"),
    _creationTime: v.number(),
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const screenings = await ctx.db
      .query("screenings")
      .withIndex("by_date", (q) => q.lt("date", today))
      .collect();
    return screenings;
  },
});

export const get = query({
  args: { id: v.id("screenings") },
  returns: v.union(
    v.object({
      _id: v.id("screenings"),
      _creationTime: v.number(),
      movieId: v.id("movies"),
      date: v.string(),
      time: v.string(),
      venue: v.string(),
      location: v.string(),
      ticketPrice: v.number(),
      maxSeats: v.number(),
      isActive: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const screening = await ctx.db.get(args.id);
    return screening;
  },
});

export const update = mutation({
  args: {
    id: v.id("screenings"),
    movieId: v.optional(v.id("movies")),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    venue: v.optional(v.string()),
    location: v.optional(v.string()),
    ticketPrice: v.optional(v.number()),
    maxSeats: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("screenings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
