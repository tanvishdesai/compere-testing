import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    director: v.optional(v.string()),
    year: v.optional(v.number()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
  },
  returns: v.id("movies"),
  handler: async (ctx, args) => {
    const movieId = await ctx.db.insert("movies", args);
    return movieId;
  },
});

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("movies"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    director: v.optional(v.string()),
    year: v.optional(v.number()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const movies = await ctx.db.query("movies").order("desc").collect();
    return movies;
  },
});

export const get = query({
  args: { id: v.id("movies") },
  returns: v.union(
    v.object({
      _id: v.id("movies"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      director: v.optional(v.string()),
      year: v.optional(v.number()),
      duration: v.optional(v.number()),
      genre: v.optional(v.string()),
      posterUrl: v.optional(v.string()),
      trailerUrl: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.id);
    return movie;
  },
});

export const update = mutation({
  args: {
    id: v.id("movies"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    director: v.optional(v.string()),
    year: v.optional(v.number()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("movies") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
