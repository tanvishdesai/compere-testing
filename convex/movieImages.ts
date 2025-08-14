import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    movieId: v.id("movies"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  },
  returns: v.id("movieImages"),
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("movieImages", args);
    return imageId;
  },
});

export const listByMovie = query({
  args: { movieId: v.id("movies") },
  returns: v.array(v.object({
    _id: v.id("movieImages"),
    _creationTime: v.number(),
    movieId: v.id("movies"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("movieImages")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
    return images;
  },
});

export const remove = mutation({
  args: { id: v.id("movieImages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
