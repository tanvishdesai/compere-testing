/**
 * UPI Payment Utilities
 * Provides comprehensive UPI payment functions following NPCI standards
 */

// UPI ID validation regex as per NPCI guidelines
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

// UPI payment limits
export const UPI_LIMITS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000, // ₹1 lakh per transaction
  MAX_DAILY_AMOUNT: 1000000, // ₹10 lakh per day
} as const;

// Popular UPI PSPs (Payment Service Providers)
export const UPI_PSPS = [
  { code: 'ybl', name: 'PhonePe', example: 'user@ybl' },
  { code: 'paytm', name: 'Paytm', example: 'user@paytm' },
  { code: 'oksbi', name: 'SBI Pay', example: 'user@oksbi' },
  { code: 'okaxis', name: 'Axis Pay', example: 'user@okaxis' },
  { code: 'okicici', name: 'iMobile Pay', example: 'user@okicici' },
  { code: 'okhdfcbank', name: 'HDFC Bank', example: 'user@okhdfcbank' },
  { code: 'upi', name: 'BHIM UPI', example: 'user@upi' },
  { code: 'gpay', name: 'Google Pay', example: 'user@gpay' },
] as const;

/**
 * Validates UPI ID format
 */
export function validateUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== 'string') return false;
  return UPI_ID_REGEX.test(upiId.trim());
}

/**
 * Validates payment amount
 */
export function validateAmount(amount: number): { isValid: boolean; error?: string } {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (amount < UPI_LIMITS.MIN_AMOUNT) {
    return { isValid: false, error: `Minimum amount is ₹${UPI_LIMITS.MIN_AMOUNT}` };
  }
  
  if (amount > UPI_LIMITS.MAX_AMOUNT) {
    return { isValid: false, error: `Maximum amount is ₹${UPI_LIMITS.MAX_AMOUNT.toLocaleString()}` };
  }
  
  return { isValid: true };
}

/**
 * Generates unique transaction reference
 */
export function generateTransactionRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TS${timestamp}${random}`;
}

/**
 * Generates standard UPI payment link as per NPCI specification
 * Enhanced with better error handling and mobile optimization
 */
export function generateUPILink(
  upiId: string,
  amount: number,
  payeeName: string,
  description: string,
  transactionRef?: string
): string {
  if (!validateUpiId(upiId)) {
    throw new Error('Invalid UPI ID format');
  }
  
  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    throw new Error(amountValidation.error);
  }
  
  // Sanitize inputs to prevent UPI link issues
  const sanitizedPayeeName = payeeName.replace(/[&=]/g, '').trim();
  const sanitizedDescription = description.replace(/[&=]/g, '').trim();
  
  const params = new URLSearchParams({
    pa: upiId.trim(), // Payee Address (UPI ID)
    pn: sanitizedPayeeName, // Payee Name
    am: amount.toFixed(2), // Amount (2 decimal places)
    cu: 'INR', // Currency
    tn: sanitizedDescription, // Transaction Note
    ...(transactionRef && { tr: transactionRef }), // Transaction Reference (optional)
  });
  
  return `upi://pay?${params.toString()}`;
}

/**
 * Detects if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Enhanced UPI app launcher with better error handling
 */
export function launchUpiApp(upiLink: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    try {
      if (isMobileDevice()) {
        // On mobile, directly open UPI app
        window.location.href = upiLink;
        
        // Set a timeout to check if the app opened successfully
        setTimeout(() => {
          // If we're still on the same page after 2 seconds, app might not have opened
          resolve(true); // We assume success for UPI apps
        }, 2000);
      } else {
        // On desktop, we can't directly open UPI apps
        resolve(false);
      }
    } catch (error) {
      console.error('Error launching UPI app:', error);
      resolve(false);
    }
  });
}

/**
 * Gets UPI PSP info from UPI ID
 */
export function getUpiPspInfo(upiId: string): { name: string; code: string } | null {
  if (!validateUpiId(upiId)) return null;
  
  const pspCode = upiId.split('@')[1]?.toLowerCase();
  const psp = UPI_PSPS.find(p => p.code === pspCode);
  
  return psp ? { name: psp.name, code: psp.code } : null;
}

/**
 * Formats UPI ID for display
 */
export function formatUpiId(upiId: string): string {
  if (!upiId) return '';
  return upiId.toLowerCase().trim();
}

/**
 * Gets suggested UPI PSPs for autocomplete
 */
export function getUpiSuggestions(input: string): string[] {
  if (!input || input.includes('@')) return [];
  
  return UPI_PSPS
    .map(psp => `${input}@${psp.code}`)
    .slice(0, 5); // Return top 5 suggestions
}

/**
 * Validates transaction reference format
 */
export function validateTransactionRef(ref: string): boolean {
  if (!ref || typeof ref !== 'string') return false;
  // Allow alphanumeric, max 35 characters as per UPI guidelines
  return /^[a-zA-Z0-9]{1,35}$/.test(ref);
}

/**
 * Parses UPI link to extract payment details
 */
export function parseUpiLink(upiLink: string): {
  upiId: string;
  amount: number;
  payeeName: string;
  description: string;
  transactionRef?: string;
} | null {
  try {
    const url = new URL(upiLink);
    if (url.protocol !== 'upi:' || url.hostname !== 'pay') return null;
    
    const params = url.searchParams;
    const upiId = params.get('pa');
    const amountStr = params.get('am');
    const payeeName = params.get('pn');
    const description = params.get('tn');
    const transactionRef = params.get('tr');
    
    if (!upiId || !amountStr || !payeeName) return null;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return null;
    
    return {
      upiId,
      amount,
      payeeName,
      description: description || '',
      ...(transactionRef && { transactionRef }),
    };
  } catch {
    return null;
  }
}

/**
 * Common UPI error messages
 */
export const UPI_ERROR_MESSAGES = {
  INVALID_UPI_ID: 'Invalid UPI ID format. Example: user@paytm',
  AMOUNT_TOO_LOW: `Minimum amount is ₹${UPI_LIMITS.MIN_AMOUNT}`,
  AMOUNT_TOO_HIGH: `Maximum amount is ₹${UPI_LIMITS.MAX_AMOUNT.toLocaleString()}`,
  BANK_LIMIT_EXCEEDED: 'Bank transaction limit exceeded. Try with a smaller amount.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  APP_NOT_FOUND: 'No UPI app found. Please install a UPI app like GPay, PhonePe, or Paytm.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds in your account.',
  TRANSACTION_DECLINED: 'Transaction declined by your bank.',
} as const;
