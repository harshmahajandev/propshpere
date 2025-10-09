import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/badge'
import LoadingSpinner from '../ui/LoadingSpinner'
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Initialize Stripe (use test key for now)
const stripePromise = loadStripe('pk_test_51QKNHpAuqLmnhGG3o1Kk7jQH6v7JZNBJWaTxwpD1A3Gd01a3UtQfYXYtmG0ZaVYb4F3O0JdHaYu8f9pY0zK9YYy8005J5n1fP8')

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  currency: string
  status: string
  due_date: string
  customer?: {
    full_name?: string
    email?: string
  }
  items: any[]
}

interface StripePaymentFormProps {
  invoice: Invoice
  onPaymentSuccess: () => void
  onCancel: () => void
}

const PaymentForm: React.FC<{ invoice: Invoice; clientSecret: string; onSuccess: () => void; onError: (error: string) => void }> = ({
  invoice,
  clientSecret,
  onSuccess,
  onError
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setPaymentError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: invoice.customer?.full_name || 'Customer',
            email: invoice.customer?.email || undefined,
          },
        },
      })

      if (error) {
        setPaymentError(error.message || 'Payment failed')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with our backend
        const { data, error: confirmError } = await supabase.functions.invoke('confirm-invoice-payment', {
          body: {
            paymentIntentId: paymentIntent.id
          }
        })

        if (confirmError) {
          setPaymentError('Payment succeeded but confirmation failed')
          onError('Payment succeeded but confirmation failed')
        } else {
          toast.success('Payment successful!')
          onSuccess()
        }
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Payment processing failed')
      onError(error.message || 'Payment processing failed')
    }

    setIsProcessing(false)
  }

  const cardElementOptions = {
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span className="font-medium">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium text-lg">
              {invoice.currency.toUpperCase()} {invoice.total_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{invoice.customer?.full_name || 'Guest'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Payment Error
              </p>
              <p className="text-sm text-red-700 mt-1">
                {paymentError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing...</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Pay {invoice.currency.toUpperCase()} {invoice.total_amount.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ invoice, onPaymentSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    createPaymentIntent()
  }, [invoice.id])

  const createPaymentIntent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('process-invoice-payment', {
        body: {
          invoiceId: invoice.id,
          customerEmail: invoice.customer?.email
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to create payment intent')
      }

      setClientSecret(data.clientSecret)
    } catch (error: any) {
      setError(error.message || 'Failed to initialize payment')
      toast.error('Failed to initialize payment')
    }

    setIsLoading(false)
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('success')
    setTimeout(() => {
      onPaymentSuccess()
    }, 2000)
  }

  const handlePaymentError = (errorMessage: string) => {
    setPaymentStatus('error')
    setError(errorMessage)
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
    },
  }

  if (paymentStatus === 'success') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            Your payment for invoice {invoice.invoice_number} has been processed successfully.
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Amount Paid: {invoice.currency.toUpperCase()} {invoice.total_amount.toLocaleString()}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCardIcon className="h-6 w-6 mr-2" />
          Pay Invoice {invoice.invoice_number}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Initializing payment..." />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3 justify-center">
              <Button onClick={createPaymentIntent} variant="outline">
                Try Again
              </Button>
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm
              invoice={invoice}
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            <div className="mt-4 pt-4 border-t">
              <Button onClick={onCancel} variant="outline" className="w-full">
                Cancel Payment
              </Button>
            </div>
          </Elements>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to initialize payment system</p>
            <Button onClick={onCancel} variant="outline" className="mt-4">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StripePaymentForm
