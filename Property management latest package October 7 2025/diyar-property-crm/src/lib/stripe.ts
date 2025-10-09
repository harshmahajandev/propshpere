import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - using test key for demo purposes
// In production, this should be environment specific
const STRIPE_PUBLISHABLE_KEY = 'pk_test_TKhL5DpZFPdeLYgBKS8d8Nf100H6OW0lMc'; // Test key for demo

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Utility functions for payment processing
export const formatCurrency = (amount: number, currency: string = 'BHD'): string => {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const createPaymentIntent = async (data: {
  amount: number;
  currency: string;
  customerEmail?: string;
  description: string;
  metadata?: Record<string, string>;
}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnilfkgeojjydbywktol.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Payment setup failed');
  }

  return response.json();
};

export const STRIPE_ERRORS = {
  CARD_DECLINED: 'Your card was declined.',
  EXPIRED_CARD: 'Your card has expired.',
  INCORRECT_CVC: 'Your card\'s security code is incorrect.',
  PROCESSING_ERROR: 'An error occurred while processing your card.',
  NETWORK_ERROR: 'A network error occurred. Please try again.',
} as const;

export const getStripeErrorMessage = (error: any): string => {
  const errorCode = error?.code;
  
  switch (errorCode) {
    case 'card_declined':
      return STRIPE_ERRORS.CARD_DECLINED;
    case 'expired_card':
      return STRIPE_ERRORS.EXPIRED_CARD;
    case 'incorrect_cvc':
      return STRIPE_ERRORS.INCORRECT_CVC;
    case 'processing_error':
      return STRIPE_ERRORS.PROCESSING_ERROR;
    default:
      return error?.message || STRIPE_ERRORS.NETWORK_ERROR;
  }
};