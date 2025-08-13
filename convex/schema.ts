import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  movies: defineTable({
    title: v.string(),
    description: v.string(),
    ticketPrice: v.number(),
    screeningDate: v.number(),
    venue: v.string(),
    location: v.string(),
    maxCapacity: v.number(),
    status: v.union(v.literal("upcoming"), v.literal("past")),
    posterImageId: v.optional(v.id("_storage")),
  }).index("by_status", ["status"])
    .index("by_screening_date", ["screeningDate"]),

  bookings: defineTable({
    movieId: v.id("movies"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    // UPI-specific fields
    upiReference: v.optional(v.string()), // "tr" reference we generate and include in the UPI link
    upiTransactionId: v.optional(v.string()), // txn/UTR user provides post-payment
    upiPayerVpa: v.optional(v.string()), // optional payer VPA
    bookingDate: v.number(),
  }).index("by_movie", ["movieId"])
    .index("by_payment_status", ["paymentStatus"]),

  screeningImages: defineTable({
    movieId: v.id("movies"),
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
    uploadedAt: v.number(),
  }).index("by_movie", ["movieId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
