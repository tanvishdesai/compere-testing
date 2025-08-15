"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { PaymentHandler } from "./PaymentHandler";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface BookingFormProps {
  screening: Doc<"screenings">;
  movie: Doc<"movies">;
  numberOfTickets: number;
  totalAmount: number;
  onCancel: () => void;
}

export function BookingForm({ screening, movie, numberOfTickets, totalAmount, onCancel }: BookingFormProps) {
  const createBooking = useMutation(api.bookings.create);
  const updateBooking = useMutation(api.bookings.updatePaymentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<Id<"bookings"> | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);

    try {
      // Create booking in Convex
      const newBookingId = await createBooking({
        screeningId: screening._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        numberOfTickets,
        totalAmount,
        paymentStatus: "PENDING",
      });

      setBookingId(newBookingId as Id<"bookings">);
      setShowPayment(true);
      toast.success("Booking created! Please complete payment.");

    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // In the new system, payment success means screenshot was uploaded
    // and is pending verification, so we just close the modal
    toast.success("Payment submitted for verification!");
    onCancel();
  };

  const handlePaymentCancel = async () => {
    if (bookingId) {
      try {
        await updateBooking({
          id: bookingId,
          paymentStatus: "CANCELLED",
        });
        toast.info("Booking cancelled.");
        onCancel();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        onCancel();
      }
    }
  };

  if (showPayment && bookingId) {
    return (
      <PaymentHandler
        amount={totalAmount}
        movieTitle={movie.title}
        bookingId={bookingId}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        upiId="tanvishdesai.05@oksbi"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Full Name *</Label>
        <Input
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          name="customerEmail"
          type="email"
          value={formData.customerEmail}
          onChange={handleInputChange}
          placeholder="Enter your email"
        />
      </div>

      <div>
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Movie:</span>
            <span>{movie.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(screening.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{screening.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Tickets:</span>
            <span>{numberOfTickets}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Booking...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Continue to Payment
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You&apos;ll be redirected to UPI payment after booking confirmation
      </p>
    </form>
  );
}
