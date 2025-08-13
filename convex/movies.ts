import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUpcomingMovies = query({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .order("asc")
      .collect();

    return Promise.all(
      movies.map(async (movie) => ({
        ...movie,
        posterUrl: movie.posterImageId 
          ? await ctx.storage.getUrl(movie.posterImageId)
          : null,
      }))
    );
  },
});

export const getPastMovies = query({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db
      .query("movies")
      .withIndex("by_status", (q) => q.eq("status", "past"))
      .order("desc")
      .collect();

    return Promise.all(
      movies.map(async (movie) => ({
        ...movie,
        posterUrl: movie.posterImageId 
          ? await ctx.storage.getUrl(movie.posterImageId)
          : null,
      }))
    );
  },
});

export const getMovieById = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    if (!movie) return null;

    const posterUrl = movie.posterImageId 
      ? await ctx.storage.getUrl(movie.posterImageId)
      : null;

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .filter((q) => q.eq(q.field("paymentStatus"), "completed"))
      .collect();

    const totalBookedTickets = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);

    return {
      ...movie,
      posterUrl,
      totalBookedTickets,
      availableTickets: movie.maxCapacity - totalBookedTickets,
    };
  },
});

export const getMovieImages = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("screeningImages")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();

    return Promise.all(
      images.map(async (image) => ({
        ...image,
        imageUrl: await ctx.storage.getUrl(image.imageId),
      }))
    );
  },
});

export const addMovie = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    ticketPrice: v.number(),
    screeningDate: v.number(),
    venue: v.string(),
    location: v.string(),
    maxCapacity: v.number(),
    posterImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const status = args.screeningDate > Date.now() ? "upcoming" : "past";
    
    return await ctx.db.insert("movies", {
      ...args,
      status,
    });
  },
});

export const updateMovie = mutation({
  args: {
    movieId: v.id("movies"),
    title: v.string(),
    description: v.string(),
    ticketPrice: v.number(),
    screeningDate: v.number(),
    venue: v.string(),
    location: v.string(),
    maxCapacity: v.number(),
    posterImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { movieId, ...updateData } = args;
    const status = args.screeningDate > Date.now() ? "upcoming" : "past";
    
    await ctx.db.patch(movieId, {
      ...updateData,
      status,
    });
  },
});

export const deleteMovie = mutation({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.movieId);
  },
});

export const addScreeningImage = mutation({
  args: {
    movieId: v.id("movies"),
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("screeningImages", {
      ...args,
      uploadedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
