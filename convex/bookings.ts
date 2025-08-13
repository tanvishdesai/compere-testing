import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createBooking = mutation({
  args: {
    movieId: v.id("movies"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    numberOfTickets: v.number(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      paymentStatus: "pending",
      bookingDate: Date.now(),
    });
  },
});

export const updateBookingPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const { bookingId, ...updateData } = args;
    await ctx.db.patch(bookingId, updateData);
  },
});

export const updateBookingUpi = mutation({
  args: {
    bookingId: v.id("bookings"),
    upiReference: v.optional(v.string()),
    upiTransactionId: v.optional(v.string()),
    upiPayerVpa: v.optional(v.string()),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const { bookingId, ...updateData } = args;
    await ctx.db.patch(bookingId, updateData);
  },
});

export const getBookingsByMovie = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();
  },
});

export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    
    return Promise.all(
      bookings.map(async (booking) => {
        const movie = await ctx.db.get(booking.movieId);
        return {
          ...booking,
          movieTitle: movie?.title || "Unknown Movie",
        };
      })
    );
  },
});

export const createRazorpayOrder = action({
  args: {
    bookingId: v.id("bookings"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await ctx.runMutation(api.bookings.updateBookingPayment, {
      bookingId: args.bookingId,
      razorpayOrderId: orderId,
      paymentStatus: "pending",
    });

    return {
      orderId,
      amount: args.amount,
      currency: "INR",
      key: "rzp_test_demo",
    };
  },
});

export const verifyPayment = action({
  args: {
    bookingId: v.id("bookings"),
    razorpayPaymentId: v.string(),
    razorpayOrderId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.bookings.updateBookingPayment, {
      bookingId: args.bookingId,
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      paymentStatus: "completed",
    });

    return { success: true };
  },
});

export const createUpiIntent = action({
  args: {
    bookingId: v.id("bookings"),
    amountInRupees: v.number(),
    payeeVpa: v.string(),
    payeeName: v.string(),
  },
  handler: async (ctx, args) => {
    const amountFixed = args.amountInRupees.toFixed(2);
    const reference = `BKG_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await ctx.runMutation(api.bookings.updateBookingUpi, {
      bookingId: args.bookingId,
      upiReference: reference,
      paymentStatus: "pending",
    });

    const params = new URLSearchParams({
      pa: args.payeeVpa,
      pn: args.payeeName,
      am: amountFixed,
      cu: "INR",
      tn: `Movie tickets ${reference}`,
      tr: reference,
    });
    const upiUrl = `upi://pay?${params.toString()}`;

    return {
      upiUrl,
      reference,
      amount: amountFixed,
    };
  },
});

export const submitUpiPaymentProof = action({
  args: {
    bookingId: v.id("bookings"),
    upiTransactionId: v.string(),
    upiPayerVpa: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.bookings.updateBookingUpi, {
      bookingId: args.bookingId,
      upiTransactionId: args.upiTransactionId,
      upiPayerVpa: args.upiPayerVpa,
      paymentStatus: "pending",
    });
    return { success: true };
  },
});

export const adminSetPaymentStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { paymentStatus: args.status });
  },
});
