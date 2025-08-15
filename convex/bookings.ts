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

// New function to handle payment verification
export const verifyPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    paymentId: v.string(),
    verificationData: v.optional(v.object({
      transactionId: v.optional(v.string()),
      bankReference: v.optional(v.string()),
      amount: v.optional(v.number()),
      timestamp: v.optional(v.number()),
    })),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    paymentStatus: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const booking = await ctx.db.get(args.bookingId);
      
      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
          paymentStatus: "FAILED",
        };
      }

      // In a real implementation, you would verify the payment with your payment gateway
      // For now, we'll simulate verification
      const isPaymentValid = await simulatePaymentVerification(args.paymentId, args.verificationData);
      
      if (isPaymentValid) {
        await ctx.db.patch(args.bookingId, {
          paymentStatus: "COMPLETED",
          paymentId: args.paymentId,
        });
        
        return {
          success: true,
          message: "Payment verified successfully",
          paymentStatus: "COMPLETED",
        };
      } else {
        await ctx.db.patch(args.bookingId, {
          paymentStatus: "FAILED",
          paymentId: args.paymentId,
        });
        
        return {
          success: false,
          message: "Payment verification failed",
          paymentStatus: "FAILED",
        };
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        message: "Payment verification error",
        paymentStatus: "FAILED",
      };
    }
  },
});

// New function to handle payment retry
export const retryPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    newAmount: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    newBookingId: v.optional(v.id("bookings")),
  }),
  handler: async (ctx, args) => {
    try {
      const originalBooking = await ctx.db.get(args.bookingId);
      
      if (!originalBooking) {
        return {
          success: false,
          message: "Original booking not found",
        };
      }

      // Create a new booking with updated amount if provided
      const newBookingData = {
        ...originalBooking,
        totalAmount: args.newAmount || originalBooking.totalAmount,
        paymentStatus: "PENDING",
        paymentId: undefined,
      };

      // Remove the _id and _creationTime fields
      delete (newBookingData as any)._id;
      delete (newBookingData as any)._creationTime;

      const newBookingId = await ctx.db.insert("bookings", newBookingData);
      
      // Mark original booking as cancelled
      await ctx.db.patch(args.bookingId, {
        paymentStatus: "CANCELLED",
      });

      return {
        success: true,
        message: "New booking created for retry",
        newBookingId,
      };
    } catch (error) {
      console.error("Payment retry error:", error);
      return {
        success: false,
        message: "Failed to create retry booking",
      };
    }
  },
});

// New function to get payment status
export const getPaymentStatus = query({
  args: { bookingId: v.id("bookings") },
  returns: v.object({
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
    lastUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) {
      throw new Error("Booking not found");
    }

    return {
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      lastUpdated: booking._creationTime,
    };
  },
});

// Helper function to simulate payment verification
async function simulatePaymentVerification(
  paymentId: string, 
  verificationData?: any
): Promise<boolean> {
  // In a real implementation, this would call your payment gateway's verification API
  // For demo purposes, we'll simulate a 90% success rate
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate verification logic
  const isSuccess = Math.random() > 0.1; // 90% success rate
  
  // Log verification attempt
  console.log(`Payment verification for ${paymentId}: ${isSuccess ? 'SUCCESS' : 'FAILED'}`);
  
  return isSuccess;
}

export const remove = mutation({
  args: { id: v.id("bookings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
