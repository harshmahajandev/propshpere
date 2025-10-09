import React, { useState } from 'react';
import { X, MapPin, Home, DollarSign, Clock, Phone, Mail, User, CreditCard } from 'lucide-react';
import ReservationPayment from './ReservationPayment';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/stripe';

interface EnhancedQuickReservationProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reservation: any) => void;
}

const EnhancedQuickReservation: React.FC<EnhancedQuickReservationProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    nationality: '',
    budgetRange: '',
    holdDays: 7
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[+]?[0-9\s-()]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleProceedToPayment = () => {
    if (validateStep1()) {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setShowPayment(false);
    onSuccess(paymentData);
    onClose();
    
    // Reset form
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      nationality: '',
      budgetRange: '',
      holdDays: 7
    });
    setStep(1);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You might want to show an error message to the user
    alert(`Payment failed: ${error}`);
  };

  if (!isOpen) return null;

  if (showPayment) {
    return (
      <ReservationPayment
        property={property}
        reservationData={{
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          holdDays: formData.holdDays
        }}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Reservation</h2>
            <p className="text-sm text-gray-600">Secure this property with a reservation deposit</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Property Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {property.title || property.id}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location || 'Diyar Islands'}
              </p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                {formatCurrency(parseFloat(property.price || 0), 'BHD')}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && (
                    <p className="text-red-600 text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-600 text-sm mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+973 xxxx xxxx"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-600 text-sm mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select nationality</option>
                    <option value="Bahraini">Bahraini</option>
                    <option value="Saudi">Saudi</option>
                    <option value="Kuwaiti">Kuwaiti</option>
                    <option value="Emirati">Emirati</option>
                    <option value="Qatari">Qatari</option>
                    <option value="Omani">Omani</option>
                    <option value="Other GCC">Other GCC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Reservation Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Budget Range
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="100-150K BHD">100-150K BHD</option>
                    <option value="150-200K BHD">150-200K BHD</option>
                    <option value="200-300K BHD">200-300K BHD</option>
                    <option value="300-400K BHD">300-400K BHD</option>
                    <option value="400K+ BHD">400K+ BHD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Hold Duration
                  </label>
                  <select
                    value={formData.holdDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, holdDays: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>7 days (recommended)</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    How long would you like to hold this property?
                  </p>
                </div>
              </div>

              {/* Reservation Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Reservation Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property Price:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(property.price || 0), 'BHD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reservation Deposit:</span>
                    <span className="font-medium">{formatCurrency(5000, 'BHD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hold Duration:</span>
                    <span className="font-medium">{formData.holdDays} days</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="font-medium">Hold Until:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + formData.holdDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {step > 1 && (
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleProceedToPayment}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Payment
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            By proceeding, you agree to our terms and conditions. A deposit of {formatCurrency(5000, 'BHD')} will be required to confirm the reservation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuickReservation;