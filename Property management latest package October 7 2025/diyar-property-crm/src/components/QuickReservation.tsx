import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../lib/utils';

interface QuickReservationProps {
  selectedProperty?: any;
  onClose?: () => void;
  onReservationComplete?: (reservation: any) => void;
}

interface BahrainIDData {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  cardExpiry: string;
  address: string;
  isValid: boolean;
}

const QuickReservation: React.FC<QuickReservationProps> = ({ 
  selectedProperty, 
  onClose, 
  onReservationComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bahrainID, setBahrainID] = useState('');
  const [idData, setIdData] = useState<BahrainIDData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    alternateContact: ''
  });
  const [reservationDetails, setReservationDetails] = useState({
    reservationAmount: 5000, // Default BD 5,000
    paymentMethod: 'bank_transfer',
    financingRequired: false,
    preferredMoveIn: '',
    specialRequests: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate Bahrain ID verification
  const simulatedIDDatabase = {
    '123456789': {
      fullName: 'Ahmed Mohammed Al-Khalifa',
      nationality: 'Bahraini',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      cardExpiry: '2027-03-15',
      address: 'Building 123, Road 456, Block 789, Manama, Bahrain',
      isValid: true
    },
    '987654321': {
      fullName: 'Sarah Abdullah Al-Mansouri',
      nationality: 'Bahraini',
      dateOfBirth: '1990-07-22',
      gender: 'Female',
      cardExpiry: '2026-07-22',
      address: 'Villa 45, Road 78, Block 12, Riffa, Bahrain',
      isValid: true
    },
    '555666777': {
      fullName: 'Mohammed Hassan Al-Farsi',
      nationality: 'Emirati',
      dateOfBirth: '1982-11-10',
      gender: 'Male',
      cardExpiry: '2025-11-10',
      address: 'Apartment 67, Road 234, Block 345, Muharraq, Bahrain',
      isValid: true
    }
  };

  const verifyBahrainID = async () => {
    if (!bahrainID.trim()) return;
    
    setIsVerifying(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = simulatedIDDatabase[bahrainID as keyof typeof simulatedIDDatabase];
    
    if (data) {
      setIdData(data);
      setContactInfo(prev => ({
        ...prev,
        email: `${data.fullName.toLowerCase().replace(/\s+/g, '.')}@email.com`
      }));
    } else {
      setIdData({
        fullName: 'Invalid ID',
        nationality: 'Unknown',
        dateOfBirth: '',
        gender: '',
        cardExpiry: '',
        address: '',
        isValid: false
      });
    }
    
    setIsVerifying(false);
  };

  const calculateTotalCost = () => {
    if (!selectedProperty) return {
      propertyPrice: 0,
      reservationAmount: 0,
      remainingAmount: 0,
      processingFee: 0
    };
    const propertyPrice = parseFloat(selectedProperty.price);
    const reservationAmount = reservationDetails.reservationAmount;
    return {
      propertyPrice,
      reservationAmount,
      remainingAmount: propertyPrice - reservationAmount,
      processingFee: reservationAmount * 0.02 // 2% processing fee
    };
  };

  const handleReservation = async () => {
    setIsProcessing(true);
    
    // Simulate reservation processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reservation = {
      id: `RES-${Date.now()}`,
      property: selectedProperty,
      customer: idData,
      contact: contactInfo,
      details: reservationDetails,
      costs: calculateTotalCost(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      reservationNumber: `DYR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    
    setIsProcessing(false);
    onReservationComplete?.(reservation);
  };

  const costs = calculateTotalCost();

  if (!selectedProperty) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m14 0V9a2 2 0 00-2-2M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Selected</h3>
        <p className="text-gray-600">Please select a property to start the reservation process</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              ID Verification
            </div>
          </div>
          
          <div className={`flex-1 h-1 mx-4 rounded ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Contact Details
            </div>
          </div>
          
          <div className={`flex-1 h-1 mx-4 rounded ${
            currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 3 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Payment & Confirmation
            </div>
          </div>
        </div>
      </div>

      {/* Property Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-8 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedProperty.title}</h2>
            <p className="text-gray-600">{selectedProperty.project} • {selectedProperty.type}</p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>{selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath</span>
              <span>{parseFloat(selectedProperty.size).toFixed(0)} sqm</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(parseFloat(selectedProperty.price))}
            </div>
            <div className="text-sm text-gray-600">Total Price</div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Bahrain ID Verification</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bahrain ID Number</label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={bahrainID}
                  onChange={(e) => setBahrainID(e.target.value)}
                  placeholder="Enter your Bahrain ID number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={verifyBahrainID}
                  disabled={isVerifying || !bahrainID.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify ID</span>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Demo IDs: 123456789, 987654321, 555666777
              </p>
            </div>

            {idData && (
              <div className={`p-4 rounded-lg border ${
                idData.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">ID Verification Result</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    idData.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {idData.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                
                {idData.isValid ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Full Name:</span>
                      <div className="font-medium">{idData.fullName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nationality:</span>
                      <div className="font-medium">{idData.nationality}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <div className="font-medium">{formatDate(idData.dateOfBirth)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <div className="font-medium">{idData.gender}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <div className="font-medium">{idData.address}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">Invalid Bahrain ID. Please check the number and try again.</p>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!idData?.isValid}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Contact Details
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  placeholder="+973 XXXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Contact (Optional)</label>
                <input
                  type="tel"
                  value={contactInfo.alternateContact}
                  onChange={(e) => setContactInfo({...contactInfo, alternateContact: e.target.value})}
                  placeholder="Emergency contact number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!contactInfo.phone || !contactInfo.email}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment & Reservation Details</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Amount (BD)</label>
                <select
                  value={reservationDetails.reservationAmount}
                  onChange={(e) => setReservationDetails({...reservationDetails, reservationAmount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5000}>BD 5,000 (Standard)</option>
                  <option value={10000}>BD 10,000 (Premium)</option>
                  <option value={15000}>BD 15,000 (Express)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={reservationDetails.paymentMethod}
                  onChange={(e) => setReservationDetails({...reservationDetails, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Move-in Date</label>
                <input
                  type="date"
                  value={reservationDetails.preferredMoveIn}
                  onChange={(e) => setReservationDetails({...reservationDetails, preferredMoveIn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={reservationDetails.financingRequired}
                  onChange={(e) => setReservationDetails({...reservationDetails, financingRequired: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Financing assistance required</label>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                <textarea
                  value={reservationDetails.specialRequests}
                  onChange={(e) => setReservationDetails({...reservationDetails, specialRequests: e.target.value})}
                  rows={3}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Property Price:</span>
                  <span className="font-medium">{formatCurrency(costs.propertyPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reservation Amount:</span>
                  <span className="font-medium text-blue-600">-{formatCurrency(costs.reservationAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee (2%):</span>
                  <span className="font-medium">{formatCurrency(costs.processingFee)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Remaining Balance:</span>
                  <span>{formatCurrency(costs.remainingAmount)}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Due Today:</span>
                  <span>{formatCurrency(costs.reservationAmount + costs.processingFee)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleReservation}
                disabled={isProcessing}
                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Complete Reservation</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickReservation;