// Payment utility functions for the Compere cinema booking system

export interface PaymentError {
  type: "BANK_LIMIT" | "NETWORK_ERROR" | "INVALID_UPI" | "PAYMENT_FAILED" | "TIMEOUT" | "INSUFFICIENT_BALANCE" | "INVALID_AMOUNT";
  message: string;
  retryable: boolean;
  suggestedAction?: string;
  errorCode?: string;
}

export interface UpiPaymentData {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  currency: string;
  merchantCode?: string;
  transactionRef?: string;
}

export interface PaymentVerificationData {
  transactionId: string;
  bankReference?: string;
  amount: number;
  timestamp: number;
  upiId: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

// Payment error definitions
export const PAYMENT_ERRORS: Record<string, PaymentError> = {
  BANK_LIMIT: {
    type: "BANK_LIMIT",
    message: "You've exceeded the bank limit for this payment. Retry with a smaller amount.",
    retryable: true,
    suggestedAction: "Try splitting the payment or use a different payment method",
    errorCode: "UPI_LIMIT_EXCEEDED"
  },
  NETWORK_ERROR: {
    type: "NETWORK_ERROR",
    message: "Network connection issue. Please check your internet connection.",
    retryable: true,
    suggestedAction: "Check your internet connection and try again",
    errorCode: "NETWORK_ERROR"
  },
  INVALID_UPI: {
    type: "INVALID_UPI",
    message: "Invalid UPI ID. Please check and enter a valid UPI ID.",
    retryable: true,
    suggestedAction: "Verify your UPI ID format (e.g., name@bank)",
    errorCode: "INVALID_UPI_ID"
  },
  PAYMENT_FAILED: {
    type: "PAYMENT_FAILED",
    message: "Payment failed. Please try again or contact your bank.",
    retryable: true,
    suggestedAction: "Check your account balance and try again",
    errorCode: "PAYMENT_FAILED"
  },
  TIMEOUT: {
    type: "TIMEOUT",
    message: "Payment verification timeout. Please verify manually.",
    retryable: true,
    suggestedAction: "Check your UPI app for payment status",
    errorCode: "VERIFICATION_TIMEOUT"
  },
  INSUFFICIENT_BALANCE: {
    type: "INSUFFICIENT_BALANCE",
    message: "Insufficient balance in your account.",
    retryable: true,
    suggestedAction: "Add money to your account or use a different payment method",
    errorCode: "INSUFFICIENT_BALANCE"
  },
  INVALID_AMOUNT: {
    type: "INVALID_AMOUNT",
    message: "Invalid payment amount. Please check the amount and try again.",
    retryable: true,
    suggestedAction: "Verify the payment amount is correct",
    errorCode: "INVALID_AMOUNT"
  }
};

// Validate UPI ID format
export function validateUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== 'string') {
    return false;
  }
  
  // UPI ID format: username@bankname
  // Username can contain: letters, numbers, dots, underscores, hyphens
  // Bank name should be at least 2 characters
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;
  return upiRegex.test(upiId.trim());
}

// Validate payment amount
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 100000 && Number.isInteger(amount);
}

// Generate UPI deep link
export function generateUpiLink(paymentData: UpiPaymentData): string {
  const {
    payeeUpiId,
    payeeName,
    amount,
    transactionNote,
    currency = "INR",
    merchantCode = "5411", // Entertainment category
    transactionRef
  } = paymentData;

  const params = new URLSearchParams({
    pa: payeeUpiId,
    pn: payeeName,
    am: amount.toString(),
    tn: transactionNote,
    cu: currency,
    mc: merchantCode,
    ...(transactionRef && { tr: transactionRef })
  });

  return `upi://pay?${params.toString()}`;
}

// UPI response interface for parsing webhook data
export interface UpiResponseData {
  txnId?: string;
  transactionId?: string;
  bankRef?: string;
  referenceId?: string;
  amount?: string | number;
  timestamp?: number;
  upiId?: string;
  payeeUpiId?: string;
  status?: "SUCCESS" | "FAILED" | "PENDING";
}

// Parse UPI response (for webhook handling)
export function parseUpiResponse(responseData: UpiResponseData): PaymentVerificationData | null {
  try {
    // This would parse the actual UPI response format
    // For now, we'll handle a generic format
    return {
      transactionId: responseData.txnId || responseData.transactionId || "",
      bankReference: responseData.bankRef || responseData.referenceId,
      amount: typeof responseData.amount === 'string' ? parseFloat(responseData.amount) : (responseData.amount || 0),
      timestamp: responseData.timestamp || Date.now(),
      upiId: responseData.upiId || responseData.payeeUpiId || "",
      status: responseData.status || "PENDING"
    };
  } catch (error) {
    console.error("Error parsing UPI response:", error);
    return null;
  }
}

// Additional data interface for payment error handling
export interface PaymentErrorData {
  amount?: number;
  retryCount?: number;
  upiId?: string;
  bankName?: string;
}

// Handle payment errors
export function handlePaymentError(errorType: string, additionalData?: PaymentErrorData): PaymentError {
  const error = PAYMENT_ERRORS[errorType];
  
  if (!error) {
    // Return a generic error if the specific error type is not found
    return {
      type: "PAYMENT_FAILED",
      message: "An unexpected payment error occurred.",
      retryable: true,
      suggestedAction: "Please try again or contact support",
      errorCode: "UNKNOWN_ERROR"
    };
  }

  // Customize error message based on additional data
  if (additionalData) {
    if (additionalData.amount && errorType === "BANK_LIMIT") {
      error.message = `Payment amount ₹${additionalData.amount} exceeds your bank limit. Please try with a smaller amount.`;
    }
    
    if (additionalData.retryCount && errorType === "NETWORK_ERROR") {
      error.message = `Network error (attempt ${additionalData.retryCount}). Please check your connection and try again.`;
    }
  }

  return error;
}

// Calculate retry delay with exponential backoff
export function calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate unique transaction reference
export function generateTransactionRef(prefix: string = "TXN"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Validate payment verification data
export function validatePaymentVerification(data: PaymentVerificationData): boolean {
  return !!(
    data.transactionId &&
    data.amount > 0 &&
    data.timestamp &&
    data.upiId &&
    data.status
  );
}

// Check if payment amount is within reasonable limits
export function isAmountWithinLimits(amount: number): { valid: boolean; reason?: string } {
  if (amount <= 0) {
    return { valid: false, reason: "Amount must be greater than 0" };
  }
  
  if (amount > 100000) {
    return { valid: false, reason: "Amount exceeds maximum limit of ₹1,00,000" };
  }
  
  if (amount < 1) {
    return { valid: false, reason: "Amount must be at least ₹1" };
  }
  
  return { valid: true };
}

// Get bank name from UPI ID
export function getBankFromUpiId(upiId: string): string | null {
  const match = upiId.match(/@([a-zA-Z]+)$/);
  return match ? match[1].toUpperCase() : null;
}

// Check if UPI ID is from a major bank (for better error handling)
export function isMajorBank(upiId: string): boolean {
  const bank = getBankFromUpiId(upiId);
  const majorBanks = [
    'SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK', 'YES', 'IDFC', 'PNB', 'BOB', 'CANARA',
    'UNION', 'IOB', 'UCO', 'CENTRAL', 'INDIAN', 'ANDHRA', 'CORPORATION', 'VIJAYA'
  ];
  return bank ? majorBanks.includes(bank) : false;
}
