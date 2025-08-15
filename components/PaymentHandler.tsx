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
  validateAmount,
  suggestPaymentSplit,
  createTestPayment,
  UPI_LIMITS,
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
  const [showAmountError, setShowAmountError] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null);
  const [, setShowTestPayment] = useState(false);
  
  const updateBookingStatus = useMutation(api.bookings.updatePaymentStatus);

  // Check if amount exceeds limits on component mount
  useState(() => {
    const validation = validateAmount(amount);
    if (!validation.isValid && validation.errorType === 'MAX') {
      setShowAmountError(true);
      setSuggestedAmount(validation.suggestedAmount || null);
    }
  });

  const handlePayNow = async (customAmount?: number) => {
    const paymentAmount = customAmount || amount;
    
    try {
      // Validate amount first
      const validation = validateAmount(paymentAmount);
      if (!validation.isValid) {
        toast.error("Amount validation failed", {
          description: validation.error,
          duration: 8000,
        });
        
        if (validation.suggestedAmount) {
          setSuggestedAmount(validation.suggestedAmount);
          setShowAmountError(true);
        }
        return;
      }

      const upiLink = generateUPILink(
        upiId,
        paymentAmount,
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
            description: `Complete payment of ₹${paymentAmount} and return here.`,
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
            description: `Paste this link on your mobile device to pay ₹${paymentAmount}.`,
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
        toast.error("Amount exceeds bank limits", {
          description: `Try with ₹${UPI_LIMITS.MAX_AMOUNT} or less, or split into multiple payments.`,
          duration: 10000,
        });
        setShowAmountError(true);
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

  const handleTestPayment = async () => {
    try {
      const testPayment = createTestPayment(upiId);
      
      if (isMobileDevice()) {
        const success = await launchUpiApp(testPayment.upiLink);
        if (success) {
          toast.success("Opening UPI app for ₹1 test...", {
            description: "This will verify your UPI setup. Complete the ₹1 payment to test.",
            duration: 8000,
          });
          setShowTestPayment(true);
        }
      } else {
        await navigator.clipboard.writeText(testPayment.upiLink);
        toast.success("₹1 test payment link copied!", {
          description: "Use this on your mobile device to test UPI setup.",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error("Test payment error:", error);
      toast.error("Failed to create test payment");
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
        {/* Amount Warning */}
        {showAmountError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Amount Exceeds Bank Limits</h4>
            <p className="text-sm text-red-700 mb-3">
              ₹{amount} exceeds the safe UPI limit of ₹{UPI_LIMITS.MAX_AMOUNT}. This may cause &quot;bank limit exceeded&quot; errors.
            </p>
            <div className="space-y-2">
              {suggestedAmount && (
                <Button
                  onClick={() => handlePayNow(suggestedAmount)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Pay Safe Amount: ₹{suggestedAmount}
                </Button>
              )}
              <Button
                onClick={handleTestPayment}
                variant="outline"
                className="w-full"
                size="sm"
              >
                🧪 Test UPI with ₹1 First
              </Button>
            </div>
          </div>
        )}

        {/* Payment Split Suggestion */}
        {amount > UPI_LIMITS.MAX_AMOUNT && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Payment Split Suggestion</h4>
            <p className="text-sm text-blue-700 mb-2">
              {suggestPaymentSplit(amount).message}
            </p>
            <p className="text-xs text-blue-600">
              You can pay each amount separately to avoid bank limits.
            </p>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3 text-gray-800">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className={`font-bold text-lg ${amount > UPI_LIMITS.MAX_AMOUNT ? 'text-red-600' : 'text-green-600'}`}>
                ₹{amount}
                {amount > UPI_LIMITS.MAX_AMOUNT && (
                  <span className="text-xs text-red-500 ml-2">(Exceeds limit)</span>
                )}
              </span>
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
            onClick={() => handlePayNow()}
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
            onClick={() => handlePayNow()}
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
          <p>⚡ Safe limit: ₹{UPI_LIMITS.MAX_AMOUNT} per transaction</p>
          <p>💡 Having issues? Contact support with reference: {transactionRef}</p>
          {paymentAttempts > 2 && (
            <p className="text-orange-600 font-medium">
              🚨 Multiple attempts detected. Try ₹1 test payment first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}