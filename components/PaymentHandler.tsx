"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smartphone, Copy, RefreshCw } from "lucide-react";
import {
  generateUPILink,
  generateTransactionRef,
  isMobileDevice,
  launchUpiApp,
} from "@/lib/upi-utils";
import { Id } from "@/convex/_generated/dataModel";

interface PaymentHandlerProps {
  amount: number;
  movieTitle: string;
  bookingId: Id<"bookings">;
  onSuccess: () => void;
  onCancel: () => void;
  upiId?: string;
}

export function PaymentHandler({ 
  amount, 
  movieTitle, 
  bookingId,
  onSuccess, 
  onCancel, 
  upiId = "tanvishdesai.05@oksbi" 
}: PaymentHandlerProps) {
  const [transactionRef] = useState(() => generateTransactionRef());
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  
  const updateBookingStatus = useMutation(api.bookings.updatePaymentStatus);

  const handlePayNow = async () => {
    try {
      const upiLink = generateUPILink(
        upiId,
        amount,
        "Compere Movies",
        `${movieTitle} - Movie Booking`,
        transactionRef
      );
      
      setPaymentAttempts(prev => prev + 1);
      
      if (isMobileDevice()) {
        // On mobile, directly open UPI app
        const success = await launchUpiApp(upiLink);
        if (success) {
          toast.success("Opening UPI app...", {
            description: "Complete the payment in your UPI app and return here.",
            duration: 8000,
          });
        } else {
          toast.error("Could not open UPI app", {
            description: "Please install a UPI app like GPay, PhonePe, or Paytm.",
            duration: 8000,
          });
        }
      } else {
        // On desktop, copy link and show instructions
        try {
          await navigator.clipboard.writeText(upiLink);
          toast.success("UPI payment link copied!", {
            description: "Paste this link in your mobile browser or send to your phone.",
            duration: 10000,
          });
        } catch (error) {
          // Fallback if clipboard API fails
          console.error("Clipboard error:", error);
          toast.info("Manual payment required", {
            description: "Use the payment details below to pay manually via any UPI app.",
            duration: 8000,
          });
        }
      }
      
    } catch (error: unknown) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("limit") || errorMessage.includes("exceeded")) {
        toast.error("Bank limit reached", {
          description: "Try with smaller amount, different account, or wait 24 hours.",
          duration: 10000,
        });
      } else if (errorMessage.includes("Invalid UPI ID")) {
        toast.error("Invalid payment configuration", {
          description: "Please contact support for assistance.",
          duration: 8000,
        });
      } else {
        toast.error("Payment setup failed", {
          description: "Please try again or contact support.",
          duration: 5000,
        });
      }
    }
  };

  const handlePaymentCompleted = async () => {
    try {
      await updateBookingStatus({
        id: bookingId,
        paymentStatus: "COMPLETED",
      });
      toast.success("Payment successful! Your booking is confirmed.");
      onSuccess();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Error confirming booking. Please contact support.");
    }
  };

  const copyUpiDetails = async () => {
    const details = `UPI ID: ${upiId}
Amount: ₹${amount}
Reference: ${transactionRef}
Description: ${movieTitle} - Movie Booking`;
    
    try {
      await navigator.clipboard.writeText(details);
      toast.success("Payment details copied to clipboard!");
    } catch (error) {
      console.error("Clipboard error:", error);
      toast.error("Failed to copy payment details");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="mr-2 h-5 w-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Pay securely using any UPI app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3 text-gray-800">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-green-600">₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Movie:</span>
              <span className="font-medium">{movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">UPI ID:</span>
              <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{transactionRef}</span>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayNow}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            size="lg"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Pay ₹{amount} via UPI
          </Button>

          {paymentAttempts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                💡 If payment failed due to bank limits, try with a smaller amount or different account
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={copyUpiDetails}
            className="w-full"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Payment Details
          </Button>

          <Button 
            onClick={handlePayNow}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Payment
          </Button>
        </div>

        {/* Payment Completed Section */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3 text-center">
            After completing payment in your UPI app:
          </p>
          <Button 
            onClick={handlePaymentCompleted}
            className="w-full bg-green-600 hover:bg-green-700"
            variant="default"
          >
            ✅ I&apos;ve Completed the Payment
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel Booking
          </Button>
        </div>

        {/* Support Info */}
        <div className="text-xs text-gray-500 text-center space-y-1 pt-2 border-t">
          <p>✅ Supported: Google Pay, PhonePe, Paytm, BHIM, and all UPI apps</p>
          <p>🔒 Secure payment via UPI standards</p>
          <p>💡 Having issues? Contact support with reference: {transactionRef}</p>
        </div>
      </CardContent>
    </Card>
  );
}