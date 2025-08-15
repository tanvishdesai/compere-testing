import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  },
  returns: v.id("bookings"),
  handler: async (ctx, args) => {
    const bookingId = await ctx.db.insert("bookings", args);
    return bookingId;
  },
});

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("bookings"),
    _creationTime: v.number(),
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const bookings = await ctx.db.query("bookings").order("desc").collect();
    return bookings;
  },
});

export const listByScreening = query({
  args: { screeningId: v.id("screenings") },
  returns: v.array(v.object({
    _id: v.id("bookings"),
    _creationTime: v.number(),
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_screening", (q) => q.eq("screeningId", args.screeningId))
      .collect();
    return bookings;
  },
});

export const listByPaymentStatus = query({
  args: { paymentStatus: v.string() },
  returns: v.array(v.object({
    _id: v.id("bookings"),
    _creationTime: v.number(),
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_payment_status", (q) => q.eq("paymentStatus", args.paymentStatus))
      .collect();
    return bookings;
  },
});

export const get = query({
  args: { id: v.id("bookings") },
  returns: v.union(
    v.object({
      _id: v.id("bookings"),
      _creationTime: v.number(),
      screeningId: v.id("screenings"),
      customerName: v.string(),
      customerEmail: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      numberOfTickets: v.number(),
      totalAmount: v.number(),
      paymentStatus: v.string(),
      paymentId: v.optional(v.string()),
      paymentScreenshotUrl: v.optional(v.string()),
      verificationStatus: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
      verifiedBy: v.optional(v.string()),
      verifiedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    return booking;
  },
});

export const update = mutation({
  args: {
    id: v.id("bookings"),
    screeningId: v.optional(v.id("screenings")),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    paymentStatus: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    id: v.id("bookings"),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, paymentStatus, paymentId } = args;
    await ctx.db.patch(id, { paymentStatus, paymentId });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("bookings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

// New mutations for payment verification workflow

export const uploadPaymentScreenshot = mutation({
  args: {
    id: v.id("bookings"),
    paymentScreenshotUrl: v.string(),
    paymentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, paymentScreenshotUrl, paymentId } = args;
    await ctx.db.patch(id, { 
      paymentScreenshotUrl, 
      paymentStatus: "PENDING_VERIFICATION",
      verificationStatus: "PENDING",
      paymentId: paymentId || `upi_${Date.now()}`,
    });
    return null;
  },
});

export const verifyPayment = mutation({
  args: {
    id: v.id("bookings"),
    approved: v.boolean(),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, approved, adminNotes, verifiedBy } = args;
    await ctx.db.patch(id, {
      paymentStatus: approved ? "VERIFIED" : "REJECTED",
      verificationStatus: approved ? "APPROVED" : "REJECTED",
      adminNotes,
      verifiedBy,
      verifiedAt: Date.now(),
    });
    return null;
  },
});

export const listPendingVerifications = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("bookings"),
    _creationTime: v.number(),
    screeningId: v.id("screenings"),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_verification_status", (q) => q.eq("verificationStatus", "PENDING"))
      .order("desc")
      .collect();
    return bookings;
  },
});
