import React, { useState } from 'react';
import { X, CreditCard, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import StripePayment from './StripePayment';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/stripe';

interface ReservationPaymentProps {
  property: any;
  reservationData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    holdDays: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

const ReservationPayment: React.FC<ReservationPaymentProps> = ({
  property,
  reservationData,
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [step, setStep] = useState<'summary' | 'payment' | 'processing' | 'success'>('summary');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  const depositAmount = 5000; // BHD 5,000 deposit
  const currency = 'BHD';
  
  const holdUntilDate = new Date(Date.now() + reservationData.holdDays * 24 * 60 * 60 * 1000);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setPaymentResult(paymentIntent);
    setStep('success');
    
    try {
      // Create the reservation record with payment confirmation
      const reservationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quick-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          customerName: reservationData.customerName,
          customerEmail: reservationData.customerEmail,
          customerPhone: reservationData.customerPhone,
          holdDays: reservationData.holdDays,
          paymentIntentId: paymentIntent.id,
          depositAmount: depositAmount,
          currency: currency
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error('Failed to create reservation record');
      }

      const reservationResult = await reservationResponse.json();
      
      // Call parent success handler
      onSuccess({
        paymentIntent,
        reservation: reservationResult.data
      });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      onError(error.message || 'Failed to complete reservation');
    }
  };

  const handlePaymentError = (error: string) => {
    setStep('summary');
    onError(error);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'summary' && 'Confirm Reservation'}
            {step === 'payment' && 'Payment Details'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Reservation Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'summary' && (
            <div className="space-y-6">
              {/* Property Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">{property.title || property.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{property.type || property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(property.price || 0), currency)}</span>
                  </div>
                </div>
              </div>

              {/* Reservation Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Reservation Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{reservationData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{reservationData.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{reservationData.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hold Duration:</span>
                    <span className="font-medium">{reservationData.holdDays} days</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span>Hold Until:</span>
                    <span className="font-medium">{holdUntilDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Required</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reservation Deposit:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(depositAmount, currency)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This deposit secures your reservation and will be applied to your final purchase.
                </p>
              </div>

              <Button
                onClick={() => setStep('payment')}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Payment
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600">Complete your reservation with a secure payment</p>
              </div>

              <StripePayment
                amount={depositAmount}
                currency={currency}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                customerEmail={reservationData.customerEmail}
                description={`Reservation deposit for ${property.title || property.id}`}
                metadata={{
                  property_id: property.id,
                  customer_name: reservationData.customerName,
                  customer_phone: reservationData.customerPhone,
                  hold_days: reservationData.holdDays.toString()
                }}
              />

              <Button
                variant="outline"
                onClick={() => setStep('summary')}
                className="w-full"
              >
                Back to Summary
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservation Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Your property reservation has been successfully confirmed.
                </p>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment ID:</span>
                      <span className="font-mono text-xs">{paymentResult?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-medium">{formatCurrency(depositAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hold Until:</span>
                      <span className="font-medium">{holdUntilDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to {reservationData.customerEmail}
                </p>
                <Button onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationPayment;