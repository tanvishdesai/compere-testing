"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";

interface PaymentHandlerProps {
  amount: number;
  movieTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
  upiId?: string;
}

export function PaymentHandler({ 
  amount, 
  movieTitle, 
  onSuccess, 
  onCancel, 
  upiId = "your-upi-id@bank" 
}: PaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending");
  const [customUpiId, setCustomUpiId] = useState(upiId);
  const [showCustomUpi, setShowCustomUpi] = useState(false);

  const handlePayment = async () => {
    setPaymentStatus("processing");
    
    try {
      // Create UPI deep link
      const upiLink = `upi://pay?pa=${customUpiId}&pn=Compere&am=${amount}&tn=${encodeURIComponent(movieTitle)}&cu=INR`;
      
      // Open UPI app
      window.open(upiLink, '_blank');
      
      // Show instructions to user
      toast.info("UPI app opened! Please complete the payment and return here.", {
        duration: 10000,
      });
      
      // Simulate payment verification (in real implementation, you'd verify with your backend)
      setTimeout(() => {
        // For demo purposes, we'll assume payment is successful
        // In real implementation, you'd verify the payment status with your backend
        setPaymentStatus("success");
        toast.success("Payment successful! Your booking is confirmed.");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 5000);
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleManualVerification = () => {
    setPaymentStatus("success");
    toast.success("Payment verified! Your booking is confirmed.");
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (paymentStatus === "success") {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
          <Button onClick={onSuccess} className="bg-green-600 hover:bg-green-700">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">Please try again or contact support.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setPaymentStatus("pending")}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          UPI Payment
        </CardTitle>
        <CardDescription>
          Complete your payment using any UPI app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Movie:</span>
              <span>{movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>UPI ID:</span>
              <span className="font-mono">{customUpiId}</span>
            </div>
          </div>
        </div>

        {showCustomUpi && (
          <div>
            <Label htmlFor="customUpi">Custom UPI ID</Label>
            <Input
              id="customUpi"
              value={customUpiId}
              onChange={(e) => setCustomUpiId(e.target.value)}
              placeholder="your-upi-id@bank"
            />
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={paymentStatus === "processing"}
          >
            {paymentStatus === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening UPI App...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ₹{amount}
              </>
            )}
          </Button>

          {paymentStatus === "processing" && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                UPI app should open automatically. Complete the payment and return here.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualVerification}
              >
                I&apos;ve Completed Payment
              </Button>
            </div>
          )}

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

        <div className="text-xs text-gray-500 text-center">
          <p>Supported UPI apps: Google Pay, PhonePe, Paytm, BHIM, etc.</p>
          <p>Make sure you have a UPI app installed on your device.</p>
        </div>
      </CardContent>
    </Card>
  );
}
