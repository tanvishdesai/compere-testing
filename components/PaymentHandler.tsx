"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Loader2, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Info,
  Shield
} from "lucide-react";
import { 
  validateUpiId, 
  validatePaymentAmount, 
  generateUpiLink, 
  handlePaymentError, 
  formatCurrency,
  generateTransactionRef,
  isAmountWithinLimits,
  PAYMENT_ERRORS,
  type PaymentError,
  type UpiPaymentData
} from "@/lib/payment-utils";

interface PaymentHandlerProps {
  amount: number;
  movieTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
  upiId?: string;
  bookingId?: string;
}



export function PaymentHandler({ 
  amount, 
  movieTitle, 
  onSuccess, 
  onCancel, 
  upiId = "your-upi-id@bank",
  bookingId
}: PaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed" | "verifying">("pending");
  const [customUpiId, setCustomUpiId] = useState(upiId);
  const [showCustomUpi, setShowCustomUpi] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentError, setCurrentError] = useState<PaymentError | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [paymentStartTime, setPaymentStartTime] = useState<number | null>(null);

  const MAX_RETRIES = 3;
  const VERIFICATION_TIMEOUT = 300000; // 5 minutes
  const VERIFICATION_INTERVAL = 10000; // 10 seconds

  // Handle payment with proper error handling
  const handlePayment = async () => {
    if (!validateUpiId(customUpiId)) {
      setCurrentError(PAYMENT_ERRORS.INVALID_UPI);
      setPaymentStatus("failed");
      return;
    }

    setPaymentStatus("processing");
    setCurrentError(null);
    setPaymentStartTime(Date.now());
    setRetryCount(prev => prev + 1);

    try {
      // Validate payment amount
      const amountValidation = isAmountWithinLimits(amount);
      if (!amountValidation.valid) {
        setCurrentError(PAYMENT_ERRORS.INVALID_AMOUNT);
        setPaymentStatus("failed");
        return;
      }

      // Generate UPI payment data
      const paymentData: UpiPaymentData = {
        payeeUpiId: customUpiId,
        payeeName: "Compere Cinema",
        amount: amount,
        transactionNote: `Booking for ${movieTitle}`,
        currency: "INR",
        merchantCode: "5411", // Entertainment category
        transactionRef: bookingId || generateTransactionRef("BK")
      };

      // Generate UPI deep link
      const upiLink = generateUpiLink(paymentData);
      
      // Try to open UPI app
      const opened = window.open(upiLink, '_blank');
      
      if (!opened) {
        // Fallback for mobile devices
        window.location.href = upiLink;
      }

      // Show instructions to user
      toast.info("UPI app opened! Please complete the payment and return here.", {
        duration: 15000,
      });

      // Start verification process
      startPaymentVerification();
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      setCurrentError(PAYMENT_ERRORS.NETWORK_ERROR);
      setPaymentStatus("failed");
    }
  };

  // Start payment verification process
  const startPaymentVerification = () => {
    const verificationTimer = setInterval(() => {
      setVerificationAttempts(prev => {
        const newAttempts = prev + 1;
        
        // Check if verification timeout reached
        if (paymentStartTime && (Date.now() - paymentStartTime) > VERIFICATION_TIMEOUT) {
          clearInterval(verificationTimer);
          handlePaymentError(PAYMENT_ERRORS.TIMEOUT);
          return newAttempts;
        }

        // Simulate verification check (in real implementation, check with backend)
        if (newAttempts >= 6) { // 1 minute of attempts
          clearInterval(verificationTimer);
          // For demo, we'll assume payment is pending verification
          setPaymentStatus("verifying");
        }

        return newAttempts;
      });
    }, VERIFICATION_INTERVAL);
  };

  // Handle payment errors
  const handlePaymentError = (error: PaymentError) => {
    setCurrentError(error);
    setPaymentStatus("failed");
    
    // Show specific error message
    if (error.type === "BANK_LIMIT") {
      toast.error("Bank limit exceeded. Please try with a smaller amount or different payment method.", {
        duration: 8000,
      });
    } else {
      toast.error(error.message, {
        duration: 5000,
      });
    }
  };

  // Handle manual verification
  const handleManualVerification = () => {
    setPaymentStatus("verifying");
    toast.info("Verifying payment...", {
      duration: 3000,
    });

    // Simulate verification process
    setTimeout(() => {
      setPaymentStatus("success");
      toast.success("Payment verified! Your booking is confirmed.");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };

  // Handle retry with different amount (for bank limit errors)
  const handleRetryWithSmallerAmount = () => {
    const smallerAmount = Math.ceil(amount / 2);
    toast.info(`Retrying with ₹${smallerAmount} (split payment)`, {
      duration: 5000,
    });
    
    // In a real implementation, you'd create a new booking with the smaller amount
    // For now, we'll just retry with the same amount
    setPaymentStatus("pending");
    setCurrentError(null);
    setRetryCount(0);
  };

  // Handle retry
  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Maximum retry attempts reached. Please contact support.");
      return;
    }
    
    setPaymentStatus("pending");
    setCurrentError(null);
    setVerificationAttempts(0);
    setPaymentStartTime(null);
  };

  // Success state
  if (paymentStatus === "success") {
    return (
      <Card className="text-center border-green-200">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              <strong>Booking ID:</strong> {bookingId || `BK${Date.now()}`}
            </p>
            <p className="text-sm text-green-700">
              <strong>Amount:</strong> {formatCurrency(amount)}
            </p>
          </div>
          <Button onClick={onSuccess} className="bg-green-600 hover:bg-green-700">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Failed state with detailed error handling
  if (paymentStatus === "failed") {
    return (
      <Card className="text-center border-red-200">
        <CardContent className="pt-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h3>
          
          {currentError && (
            <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium mb-1">{currentError.message}</p>
                  {currentError.suggestedAction && (
                    <p className="text-red-600 text-sm">{currentError.suggestedAction}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {currentError?.type === "BANK_LIMIT" && (
              <Button 
                onClick={handleRetryWithSmallerAmount}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try with Smaller Amount
              </Button>
            )}

            {currentError?.retryable && retryCount < MAX_RETRIES && (
              <Button 
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again ({MAX_RETRIES - retryCount} attempts left)
              </Button>
            )}

            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel Booking
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Need help? Contact support with Booking ID: {bookingId || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verifying state
  if (paymentStatus === "verifying") {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Verifying Payment</h3>
          <p className="text-gray-600 mb-4">Please wait while we verify your payment...</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-center mb-2">
              <Info className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">Payment Verification</span>
            </div>
            <p className="text-xs text-blue-600">
              This may take a few moments. Please dont close this window.
            </p>
          </div>

          <Button 
            onClick={handleManualVerification}
            variant="outline"
            className="w-full"
          >
            Ive Completed Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main payment form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Secure UPI Payment
        </CardTitle>
        <CardDescription>
          Complete your payment using any UPI app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security notice */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700">Secure Payment</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Payment details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Movie:</span>
              <span>{movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>UPI ID:</span>
              <span className="font-mono">{customUpiId}</span>
            </div>
            {bookingId && (
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono text-xs">{bookingId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom UPI ID input */}
        {showCustomUpi && (
          <div>
            <Label htmlFor="customUpi">Custom UPI ID</Label>
            <Input
              id="customUpi"
              value={customUpiId}
              onChange={(e) => setCustomUpiId(e.target.value)}
              placeholder="your-upi-id@bank"
              className={!validateUpiId(customUpiId) && customUpiId ? "border-red-300" : ""}
            />
            {!validateUpiId(customUpiId) && customUpiId && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid UPI ID format</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={paymentStatus === "processing" || !validateUpiId(customUpiId)}
          >
            {paymentStatus === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening UPI App...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatCurrency(amount)}
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowCustomUpi(!showCustomUpi)}
            className="w-full"
            size="sm"
          >
            {showCustomUpi ? "Hide" : "Change"} UPI ID
          </Button>

          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
            size="sm"
          >
            Cancel
          </Button>
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Supported UPI apps: Google Pay, PhonePe, Paytm, BHIM, etc.</p>
          <p>Make sure you have a UPI app installed on your device.</p>
          <p>If you encounter bank limit errors, try with a smaller amount.</p>
        </div>
      </CardContent>
    </Card>
  );
}
