import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

// Import from lib/stripe
import { stripePromise } from '../lib/stripe';

// Type definitions for better TypeScript support
type PaymentIntentResult = {
  paymentIntent?: any;
  error?: any;
};

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerEmail?: string;
  description: string;
  metadata?: Record<string, string>;
  disabled?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  customerEmail,
  description,
  metadata = {},
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Call your backend to create a payment intent
      const supabaseUrl = 'https://jnilfkgeojjydbywktol.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          customerEmail,
          description,
          metadata: {
            ...metadata,
            type: 'reservation_deposit'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Payment setup failed');
      }

      // Confirm the payment with Stripe
      const result: PaymentIntentResult = await stripe.confirmCardPayment(
        data.data.clientSecret,
        {
          payment_method: {
            card: cardElement as any, // Type assertion to fix compatibility issues
            billing_details: {
              email: customerEmail || undefined,
            },
          },
        }
      );
      
      const { error: confirmError, paymentIntent } = result;

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onError(confirmError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your reservation deposit has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Payment Amount</span>
          <span className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('en-BH', {
              style: 'currency',
              currency: currency.toUpperCase(),
              minimumFractionDigits: 0,
            }).format(amount)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center text-xs text-gray-500">
          <Lock className="w-3 h-3 mr-1" />
          Secured by Stripe. Your payment information is encrypted and secure.
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Processing Payment...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-BH', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
          }).format(amount)}`
        )}
      </Button>
    </form>
  );
};

interface StripePaymentProps extends StripePaymentFormProps {}

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment;
export { StripePaymentForm };
export type { StripePaymentFormProps };