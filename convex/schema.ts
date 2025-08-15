import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
    title: v.string(),
    description: v.string(),
    director: v.optional(v.string()),
    year: v.optional(v.number()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    trailerUrl: v.optional(v.string()),
  }),

  screenings: defineTable({
    movieId: v.id("movies"),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    ticketPrice: v.number(),
    maxSeats: v.number(),
    isActive: v.boolean(),
  })
    .index("by_movie", ["movieId"])
    .index("by_date", ["date"])
    .index("by_active", ["isActive"]),

  bookings: defineTable({
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(), // "PENDING", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "CANCELLED"
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()), // "PENDING", "APPROVED", "REJECTED"
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_screening", ["screeningId"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_verification_status", ["verificationStatus"]),

  movieImages: defineTable({
    movieId: v.id("movies"),
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  }).index("by_movie", ["movieId"]),
});
