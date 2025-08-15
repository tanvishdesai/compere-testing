"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle, XCircle, QrCode, Smartphone, Monitor, Copy } from "lucide-react";
import {
  validateUpiId,
  validateAmount,
  generateUPILink,
  generateTransactionRef,
  isMobileDevice,
  UPI_ERROR_MESSAGES,
  getUpiPspInfo
} from "@/lib/upi-utils";

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
  upiId = "tanvishdesai.05@oksbi" 
}: PaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending");
  const [customUpiId, setCustomUpiId] = useState(upiId);
  const [showCustomUpi, setShowCustomUpi] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [transactionRef] = useState(() => generateTransactionRef());
  const [isMobile, setIsMobile] = useState(false);
  const [upiValidationError, setUpiValidationError] = useState<string>("");

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Validate UPI ID on change
  useEffect(() => {
    if (customUpiId && !validateUpiId(customUpiId)) {
      setUpiValidationError(UPI_ERROR_MESSAGES.INVALID_UPI_ID);
    } else {
      setUpiValidationError("");
    }
  }, [customUpiId]);

  const handlePayment = async () => {
    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      toast.error(amountValidation.error || "Invalid amount");
      return;
    }

    // Validate UPI ID
    if (!validateUpiId(customUpiId)) {
      toast.error(UPI_ERROR_MESSAGES.INVALID_UPI_ID);
      setUpiValidationError(UPI_ERROR_MESSAGES.INVALID_UPI_ID);
      return;
    }

    setPaymentStatus("processing");
    
    try {
      const upiLink = generateUPILink(
        customUpiId,
        amount,
        "Compere Movies",
        `${movieTitle} - Movie Booking`,
        transactionRef
      );
      
      if (isMobile) {
        // Mobile: Direct UPI app opening
        window.location.href = upiLink;
        
        const pspInfo = getUpiPspInfo(customUpiId);
        const appName = pspInfo ? pspInfo.name : "UPI app";
        
        toast.info(`${appName} should open automatically. Complete payment and return here.`, {
          duration: 15000,
        });
      } else {
        // Desktop: Show QR code
        setShowQRDialog(true);
        
        toast.info("Scan the QR code with any UPI app or use manual payment details.", {
          duration: 10000,
        });
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      
      // Show specific error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(UPI_ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    }
  };

  const handleManualVerification = () => {
    setPaymentStatus("success");
    setShowQRDialog(false);
    toast.success("Payment verified! Your booking is confirmed.");
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handleRetryPayment = () => {
    setPaymentStatus("pending");
    setShowQRDialog(false);
  };

  const copyUpiLink = async () => {
    try {
      const upiLink = generateUPILink(
        customUpiId,
        amount,
        "Compere Movies",
        `${movieTitle} - Movie Booking`,
        transactionRef
      );
      
      await navigator.clipboard.writeText(upiLink);
      toast.success("UPI link copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy UPI link");
    }
  };

  const copyTransactionDetails = async () => {
    const details = `UPI ID: ${customUpiId}\nAmount: ₹${amount}\nReference: ${transactionRef}\nDescription: ${movieTitle} - Movie Booking`;
    
    try {
      await navigator.clipboard.writeText(details);
      toast.success("Payment details copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy payment details");
    }
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
          <p className="text-gray-600 mb-4">Please check your details and try again, or contact support.</p>
          <div className="text-xs text-gray-500 mb-4">
            <p className="font-medium mb-2">Common issues & solutions:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li><span className="font-medium">Invalid UPI ID:</span> Check format (user@paytm)</li>
              <li><span className="font-medium">Bank limits:</span> Try smaller amount or check daily limits</li>
              <li><span className="font-medium">Network issues:</span> Check internet connection</li>
              <li><span className="font-medium">UPI app:</span> Install/update GPay, PhonePe, Paytm, etc.</li>
              <li><span className="font-medium">Insufficient funds:</span> Check account balance</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-blue-800">
              💡 <span className="font-medium">Tip:</span> Try different UPI ID or contact your bank for transaction limits
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleRetryPayment}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isMobile ? <Smartphone className="mr-2 h-5 w-5" /> : <Monitor className="mr-2 h-5 w-5" />}
            UPI Payment {isMobile ? "(Mobile)" : "(Desktop)"}
          </CardTitle>
          <CardDescription>
            {isMobile 
              ? "Your UPI app will open automatically for payment" 
              : "Scan QR code or use manual payment details"
            }
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
                <span className="font-mono break-all">{customUpiId}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-xs">{transactionRef}</span>
              </div>
            </div>
          </div>

          {showCustomUpi && (
            <div>
              <Label htmlFor="customUpi">Recipient UPI ID</Label>
              <Input
                id="customUpi"
                value={customUpiId}
                onChange={(e) => setCustomUpiId(e.target.value)}
                placeholder="user@paytm"
                className={upiValidationError ? "border-red-500" : ""}
              />
              {upiValidationError && (
                <p className="text-red-500 text-xs mt-1">{upiValidationError}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={paymentStatus === "processing" || !!upiValidationError}
            >
              {paymentStatus === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isMobile ? "Opening UPI App..." : "Generating QR Code..."}
                </>
              ) : (
                <>
                  {isMobile ? <Smartphone className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
                  Pay ₹{amount} via UPI
                </>
              )}
            </Button>

            {paymentStatus === "processing" && (
              <div className="text-center space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    ✨ Payment Details:
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Amount: ₹{amount.toFixed(2)}</p>
                    <p>• To: Compere Movies</p>
                    <p>• UPI ID: {customUpiId}</p>
                    <p>• Reference: {transactionRef}</p>
                  </div>
                </div>
                
                {isMobile ? (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">If your UPI app didn&apos;t open automatically:</p>
                    <ol className="list-decimal list-inside text-left space-y-1">
                      <li>Open any UPI app (GPay, PhonePe, Paytm, BHIM)</li>
                      <li>Send money to: <span className="font-mono">{customUpiId}</span></li>
                      <li>Amount: ₹{amount.toFixed(2)}</li>
                      <li>Add reference: <span className="font-mono">{transactionRef}</span></li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>Scan the QR code with any UPI app or use the manual details above.</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyTransactionDetails}
                    className="flex-1"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleManualVerification}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Payment Done
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomUpi(!showCustomUpi)}
                className="flex-1"
                size="sm"
              >
                {showCustomUpi ? "Hide" : "Change"} UPI ID
              </Button>

              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>✅ Supported: Google Pay, PhonePe, Paytm, BHIM, and all UPI apps</p>
            <p>🔒 Secure payment via UPI specification standards</p>
            {!isMobile && <p>📱 Works better on mobile devices</p>}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog for Desktop */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Scan QR Code to Pay</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border mx-auto inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUPILink(customUpiId, amount, "Compere Movies", `${movieTitle} - Movie Booking`, transactionRef))}`}
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="text-center hidden">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">QR Code</p>
                  <p className="text-xs text-gray-500 mt-1">₹{amount}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">How to pay:</p>
              <ol className="list-decimal list-inside text-left space-y-1">
                <li>Open any UPI app on your phone</li>
                <li>Scan the QR code above</li>
                <li>Verify amount: ₹{amount}</li>
                <li>Complete the payment</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-xs font-medium text-gray-700 mb-1">Manual Payment Details:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>UPI ID: <span className="font-mono">{customUpiId}</span></p>
                <p>Amount: ₹{amount.toFixed(2)}</p>
                <p>Reference: <span className="font-mono">{transactionRef}</span></p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyUpiLink}
                className="flex-1"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy UPI Link
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualVerification}
                className="flex-1"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Payment Done
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowQRDialog(false)}
              className="w-full"
              size="sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
