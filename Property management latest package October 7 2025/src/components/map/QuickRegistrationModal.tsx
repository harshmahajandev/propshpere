import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'
import { villaApi, Villa, QuickRegistrationData } from '../../api/villas'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface QuickRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  villa: Villa | null
  onSuccess?: (leadId: string) => void
}

interface FormData {
  customer_name: string
  customer_phone: string
  customer_email: string
  interest_level: 'low' | 'medium' | 'high'
  budget_range: string
  preferred_contact_method: 'phone' | 'email' | 'whatsapp'
  preferred_contact_time: string
  notes: string
}

const QuickRegistrationModal: React.FC<QuickRegistrationModalProps> = ({
  isOpen,
  onClose,
  villa,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    interest_level: 'medium',
    budget_range: '',
    preferred_contact_method: 'phone',
    preferred_contact_time: 'morning',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && villa) {
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        interest_level: 'medium',
        budget_range: villa.price ? `${Math.floor(villa.price * 0.8)}-${Math.floor(villa.price * 1.2)}` : '',
        preferred_contact_method: 'phone',
        preferred_contact_time: 'morning',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen, villa])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required'
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{6,14}$/.test(formData.customer_phone.replace(/\s+/g, ''))) {
      newErrors.customer_phone = 'Please enter a valid phone number'
    }
    
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!villa || !validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const registrationData: QuickRegistrationData = {
        villa_id: villa.id,
        ...formData
      }
      
      const result = await villaApi.quickRegisterLeadFromVilla(registrationData)
      
      toast.success(`Lead created successfully! Lead ID: ${result.lead_id}`)
      
      if (onSuccess) {
        onSuccess(result.lead_id)
      }
      
      onClose()
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create lead')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (!isOpen || !villa) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <HomeIcon className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold">Quick Registration</h3>
                  <p className="text-blue-100 text-sm">Villa {villa.unit_number} - {formatPrice(villa.price)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={loading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <span>Customer Information</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer name"
                    disabled={loading}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+973 XXXX XXXX"
                    disabled={loading}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customer_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="customer@example.com"
                  disabled={loading}
                />
                {errors.customer_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>
                )}
              </div>
            </div>

            {/* Interest & Budget */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Interest & Budget</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Level
                  </label>
                  <select
                    value={formData.interest_level}
                    onChange={(e) => handleInputChange('interest_level', e.target.value as FormData['interest_level'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="low">Low - Just browsing</option>
                    <option value="medium">Medium - Considering options</option>
                    <option value="high">High - Ready to purchase</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range (BHD)
                  </label>
                  <input
                    type="text"
                    value={formData.budget_range}
                    onChange={(e) => handleInputChange('budget_range', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000-150000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Contact Preferences</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={formData.preferred_contact_method}
                    onChange={(e) => handleInputChange('preferred_contact_method', e.target.value as FormData['preferred_contact_method'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="phone">📞 Phone Call</option>
                    <option value="email">📧 Email</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Time
                  </label>
                  <select
                    value={formData.preferred_contact_time}
                    onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific requirements or questions..."
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Lead...</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5" />
                    <span>Create Lead</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuickRegistrationModal