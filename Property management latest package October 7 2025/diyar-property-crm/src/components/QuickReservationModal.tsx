import React, { useState } from 'react';
import { X, MapPin, Home, DollarSign, Clock, Phone, Mail, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface QuickReservationModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reservation: any) => void;
}

const QuickReservationModal: React.FC<QuickReservationModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-reservation', {
        body: {
          propertyId: property.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          nationality: formData.nationality,
          budgetRange: formData.budgetRange,
          holdDays: formData.holdDays
        }
      });

      if (error) {
        throw error;
      }

      if (data?.data) {
        onSuccess(data.data);
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
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Reservation</h2>
            <p className="text-sm text-gray-600">Reserve this property in just a few steps</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Property Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{property.property_name || `${property.type} in ${property.project}`}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{property.project}, {property.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(parseFloat(property.price))}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Home className="w-4 h-4" />
                  <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${
              step >= 1 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Contact Info</span>
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center space-x-2 ${
              step >= 2 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Preferences</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? 'border-red-300' : 'border-gray-300'
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+973-XXXX-XXXX"
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
                    <span className="font-medium">{formatCurrency(parseFloat(property.price))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reservation Deposit:</span>
                    <span className="font-medium">{formatCurrency(5000)}</span>
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
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Reservation...' : 'Reserve Property'}
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            By proceeding, you agree to our terms and conditions. A deposit of {formatCurrency(5000)} will be required to confirm the reservation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickReservationModal;