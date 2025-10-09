import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Building, DollarSign, FileText, Plus } from 'lucide-react';
import { invoiceAPI } from '../../lib/invoiceAPI';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  price: number;
}

interface Booking {
  id: string;
  booking_reference: string;
  total_price: number;
  customer: Customer;
  property: Property;
}

interface Milestone {
  id: string;
  milestone_name: string;
  percentage: number;
  description: string;
  milestone_order: number;
}

interface InvoiceGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceGenerated: (invoice: any) => void;
}

const InvoiceGenerationModal: React.FC<InvoiceGenerationModalProps> = ({
  isOpen,
  onClose,
  onInvoiceGenerated
}) => {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<'milestone' | 'custom'>('milestone');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      // Set default due date to 30 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCustomer) {
      loadBookingsForCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedBooking && invoiceType === 'milestone') {
      loadMilestonesForPropertyType(selectedBooking.property.property_type);
    }
  }, [selectedBooking, invoiceType]);

  const loadCustomers = async () => {
    try {
      const result = await invoiceAPI.getCustomers();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadBookingsForCustomer = async (customerId: string) => {
    try {
      const result = await invoiceAPI.getBookings(customerId);
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const loadMilestonesForPropertyType = async (propertyType: string) => {
    try {
      const result = await invoiceAPI.getMilestones(propertyType);
      if (result.success) {
        setMilestones(result.data);
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
    }
  };

  const generateInvoice = async () => {
    if (!selectedBooking) {
      setError('Please select a booking');
      return;
    }

    if (invoiceType === 'milestone' && !selectedMilestone) {
      setError('Please select a milestone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (invoiceType === 'milestone') {
        result = await invoiceAPI.generateMilestoneInvoice({
          booking_id: selectedBooking.id,
          milestone_name: selectedMilestone,
          custom_amount: customAmount ? parseFloat(customAmount) : undefined,
          due_date: dueDate,
          notes
        });
      } else {
        // Custom invoice generation
        result = await invoiceAPI.createInvoice({
          customer_id: selectedBooking.customer.id,
          property_id: selectedBooking.property.id,
          booking_id: selectedBooking.id,
          amount: parseFloat(customAmount || '0'),
          due_date: dueDate,
          notes,
          items: [{
            description: `Custom invoice for ${selectedBooking.property.title}`,
            quantity: 1,
            unit_price: parseFloat(customAmount || '0'),
            amount: parseFloat(customAmount || '0')
          }]
        });
      }
      
      if (result.success) {
        onInvoiceGenerated(result.data);
        resetForm();
        onClose();
      } else {
        setError(result.error?.message || 'Failed to generate invoice');
      }
    } catch (error) {
      setError('Failed to generate invoice');
      console.error('Invoice generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer('');
    setSelectedBooking(null);
    setSelectedMilestone('');
    setCustomAmount('');
    setNotes('');
    setInvoiceType('milestone');
    setError('');
  };

  const getCalculatedAmount = () => {
    if (!selectedBooking || !selectedMilestone) return 0;
    const milestone = milestones.find(m => m.milestone_name === selectedMilestone);
    if (!milestone) return 0;
    return selectedBooking.total_price * milestone.percentage / 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>

          {/* Step 1: Customer & Booking Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Customer & Booking</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking
                    </label>
                    <div className="space-y-2">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedBooking?.id === booking.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{booking.property.title}</div>
                              <div className="text-sm text-gray-600">
                                {booking.booking_reference} • BD {booking.total_price.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.property.property_type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Invoice Type & Milestone Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invoice Configuration</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="milestone"
                        checked={invoiceType === 'milestone'}
                        onChange={(e) => setInvoiceType(e.target.value as 'milestone' | 'custom')}
                        className="mr-2"
                      />
                      Milestone-based
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="custom"
                        checked={invoiceType === 'custom'}
                        onChange={(e) => setInvoiceType(e.target.value as 'milestone' | 'custom')}
                        className="mr-2"
                      />
                      Custom Amount
                    </label>
                  </div>
                </div>

                {invoiceType === 'milestone' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Milestone
                    </label>
                    <select
                      value={selectedMilestone}
                      onChange={(e) => setSelectedMilestone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a milestone...</option>
                      {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.milestone_name}>
                          {milestone.milestone_name} ({milestone.percentage}%) - BD {selectedBooking ? (selectedBooking.total_price * milestone.percentage / 100).toLocaleString() : '0'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (BD)
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={invoiceType === 'milestone' && selectedMilestone ? getCalculatedAmount().toString() : 'Enter amount'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {invoiceType === 'milestone' && !customAmount && selectedMilestone
                      ? `Default: BD ${getCalculatedAmount().toLocaleString()}`
                      : 'Leave blank to use calculated milestone amount'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Invoice Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invoice Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes or payment instructions..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Invoice Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Invoice Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{selectedBooking?.customer.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Property:</span>
                      <span>{selectedBooking?.property.title}</span>
                    </div>
                    {invoiceType === 'milestone' && selectedMilestone && (
                      <div className="flex justify-between">
                        <span>Milestone:</span>
                        <span>{selectedMilestone}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Amount:</span>
                      <span>BD {(customAmount ? parseFloat(customAmount) : getCalculatedAmount()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedBooking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={generateInvoice}
                disabled={loading || (!selectedMilestone && invoiceType === 'milestone') || (!customAmount && invoiceType === 'custom')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Generate Invoice
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerationModal;