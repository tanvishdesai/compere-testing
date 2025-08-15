"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Smartphone, Upload, CheckCircle, AlertCircle, Copy } from "lucide-react";
import {
  generateUPILink,
  generateTransactionRef,
  isMobileDevice,
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

type PaymentStep = "redirect" | "upload" | "pending" | "success";

export function PaymentHandler({ 
  amount, 
  movieTitle, 
  bookingId,
  onSuccess, 
  onCancel, 
  upiId = "tanvishdesai.05@oksbi" 
}: PaymentHandlerProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("redirect");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionRef] = useState(() => generateTransactionRef());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadScreenshot = useMutation(api.bookings.uploadPaymentScreenshot);

  const handleRedirectToUpi = () => {
    const upiLink = generateUPILink(
      upiId,
      amount,
      "Compere Movies",
      `${movieTitle} - Movie Booking`,
      transactionRef
    );
    
    if (isMobileDevice()) {
      // On mobile, try to open UPI app directly
      window.location.href = upiLink;
      toast.info("UPI app should open. Complete payment and return here.", {
        duration: 10000,
      });
    } else {
      // On desktop, copy link and show instructions
      navigator.clipboard.writeText(upiLink).then(() => {
        toast.success("UPI link copied! Open on your mobile device to pay.");
      }).catch(() => {
        toast.info("Please use the UPI link on your mobile device to complete payment.");
      });
    }
    
    // Move to upload step after a short delay
    setTimeout(() => {
      setCurrentStep("upload");
    }, 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // For demo purposes, we'll create a local URL
      // In a real app, you'd upload to a cloud storage service
      // const localUrl = URL.createObjectURL(file);
      // setUploadedUrl(localUrl);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!selectedFile) {
      toast.error("Please select a screenshot first");
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real implementation, you'd upload the file to cloud storage
      // For demo purposes, we'll simulate this with a base64 data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        
        try {
          await uploadScreenshot({
            id: bookingId,
            paymentScreenshotUrl: result, // In reality, this would be a cloud storage URL
            paymentId: transactionRef,
          });
          
          setCurrentStep("pending");
          toast.success("Screenshot uploaded! Your payment is under review.");
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Failed to upload screenshot. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot. Please try again.");
      setIsLoading(false);
    }
  };

  const copyUpiDetails = () => {
    const details = `UPI ID: ${upiId}
Amount: ₹${amount}
Reference: ${transactionRef}
Description: ${movieTitle} - Movie Booking`;
    
    navigator.clipboard.writeText(details).then(() => {
      toast.success("Payment details copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy payment details");
    });
  };

  // Step 1: UPI Redirect
  if (currentStep === "redirect") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Complete Payment
          </CardTitle>
          <CardDescription>
            You&apos;ll be redirected to your UPI app to complete the payment
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
                <span className="font-mono break-all">{upiId}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-xs">{transactionRef}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRedirectToUpi}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Pay ₹{amount} via UPI
            </Button>

            <Button 
              variant="outline" 
              onClick={copyUpiDetails}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Payment Details
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("upload")}
                className="flex-1"
                size="sm"
              >
                Already Paid? Upload Screenshot
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
            <p>🔒 Secure payment via UPI standards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Screenshot Upload
  if (currentStep === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Payment Screenshot
          </CardTitle>
          <CardDescription>
            Upload a screenshot of your successful payment from the UPI app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Payment Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
              <li>Send ₹{amount} to: <span className="font-mono">{upiId}</span></li>
              <li>Use reference: <span className="font-mono">{transactionRef}</span></li>
              <li>Take a screenshot of the success message</li>
              <li>Upload the screenshot below</li>
            </ol>
          </div>

          <div>
            <Label htmlFor="screenshot">Payment Screenshot *</Label>
            <div className="mt-2">
              <Input
                ref={fileInputRef}
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: JPG, PNG, WebP (Max 5MB)
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ File selected: {selectedFile.name}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleUploadScreenshot}
              disabled={!selectedFile || isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Screenshot...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Submit for Verification
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("redirect")}
                className="flex-1"
                size="sm"
                disabled={isLoading}
              >
                Back to Payment
              </Button>

              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                size="sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Pending Verification
  if (currentStep === "pending") {
    return (
      <Card className="text-center">
        <CardContent className="pt-6">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-yellow-600 mb-2">
            Payment Under Review
          </h3>
          <p className="text-gray-600 mb-4">
            Your payment screenshot has been submitted successfully. Our team will verify it and confirm your booking within 24 hours.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              📧 You&apos;ll receive an email confirmation once your payment is verified.
            </p>
          </div>
          <Button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Success (if needed)
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Verified!</h3>
        <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
        <Button onClick={onSuccess} className="bg-green-600 hover:bg-green-700">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}