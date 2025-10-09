import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Phone, Mail, Globe, DollarSign, MessageSquare, Check } from 'lucide-react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Property } from '@/lib/supabase'
import { useReservationStore } from '@/stores/reservation-store'
import { useAuthStore } from '@/stores/auth-store'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn, formatCurrency, generateConfirmationNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReservationFormProps {
  property: Property
  isOpen: boolean
  onClose: () => void
}

interface ReservationFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_nationality: string
  viewing_date: string
  preferred_contact_time: string
  budget_min: number
  budget_max: number
  financing_needed: boolean
  special_requirements: string
}

const ReservationForm: React.FC<ReservationFormProps> = ({ property, isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { createReservation, loading } = useReservationStore()
  const [step, setStep] = useState(1)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<ReservationFormData>({
    defaultValues: {
      customer_name: user?.full_name || '',
      customer_email: user?.email || '',
      customer_phone: user?.phone || '',
      customer_nationality: user?.nationality || '',
      financing_needed: false,
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit: SubmitHandler<ReservationFormData> = async (data) => {
    try {
      const reservation = await createReservation({
        property_id: property.id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_nationality: data.customer_nationality,
        viewing_date: data.viewing_date || undefined,
        preferred_contact_time: data.preferred_contact_time || undefined,
        budget_min: data.budget_min || undefined,
        budget_max: data.budget_max || undefined,
        financing_needed: data.financing_needed,
        special_requirements: data.special_requirements || undefined,
      })

      setConfirmationData({
        confirmation_number: generateConfirmationNumber(reservation.id),
        property_title: property.title,
        customer_name: data.customer_name,
        viewing_date: data.viewing_date,
      })
      setReservationSuccess(true)
    } catch (error) {
      console.error('Reservation error:', error)
    }
  }

  const handleClose = () => {
    reset()
    setStep(1)
    setReservationSuccess(false)
    setConfirmationData(null)
    onClose()
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return watchedValues.customer_name && watchedValues.customer_email && watchedValues.customer_phone
      case 2:
        return true // Optional fields
      case 3:
        return true // Review step
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {reservationSuccess ? (
            // Success State
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="h-10 w-10 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reservation Confirmed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Thank you for your interest in {confirmationData?.property_title}. 
                Your reservation has been successfully submitted.
              </p>
              
              <Card className="text-left mb-6">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Reservation Details</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Confirmation Number:</span>
                      <span className="font-mono font-bold text-blue-600">
                        {confirmationData?.confirmation_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Property:</span>
                      <span className="font-medium">{confirmationData?.property_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-medium">{confirmationData?.customer_name}</span>
                    </div>
                    {confirmationData?.viewing_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Viewing Date:</span>
                        <span className="font-medium">
                          {new Date(confirmationData.viewing_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our sales team will contact you within 24 hours</li>
                  <li>• We'll schedule a property viewing at your convenience</li>
                  <li>• You'll receive a confirmation email shortly</li>
                </ul>
              </div>
              
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            // Form State
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reserve Property</h2>
                  <p className="text-sm text-gray-600 mt-1">{property.title}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        step >= stepNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      )}>
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={cn(
                          'w-16 h-1 mx-2',
                          step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Personal Info</span>
                  <span>Preferences</span>
                  <span>Review</span>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('customer_name', { required: 'Full name is required' })}
                            className={cn(
                              'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              errors.customer_name ? 'border-red-300' : 'border-gray-300'
                            )}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {errors.customer_name && (
                          <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('customer_email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            type="email"
                            className={cn(
                              'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              errors.customer_email ? 'border-red-300' : 'border-gray-300'
                            )}
                            placeholder="Enter your email"
                          />
                        </div>
                        {errors.customer_email && (
                          <p className="text-red-600 text-sm mt-1">{errors.customer_email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('customer_phone', { required: 'Phone number is required' })}
                            type="tel"
                            className={cn(
                              'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              errors.customer_phone ? 'border-red-300' : 'border-gray-300'
                            )}
                            placeholder="+973 XXXX XXXX"
                          />
                        </div>
                        {errors.customer_phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.customer_phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nationality
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('customer_nationality')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your nationality"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Preferences */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Preferences & Requirements
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Viewing Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('viewing_date')}
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Contact Time
                        </label>
                        <select
                          {...register('preferred_contact_time')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select time preference</option>
                          <option value="morning">Morning (9AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 5PM)</option>
                          <option value="evening">Evening (5PM - 8PM)</option>
                          <option value="weekend">Weekend</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range (Min) - BHD
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('budget_min', { valueAsNumber: true })}
                            type="number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Minimum budget"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range (Max) - BHD
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('budget_max', { valueAsNumber: true })}
                            type="number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Maximum budget"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          {...register('financing_needed')}
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          I am interested in financing options
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requirements or Notes
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          {...register('special_requirements')}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Any specific requirements, questions, or preferences..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Review Your Reservation
                      </h3>
                    </div>

                    <Card>
                      <CardHeader>
                        <h4 className="font-medium text-gray-900">Property Details</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property:</span>
                            <span className="font-medium">{property.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Project:</span>
                            <span className="font-medium">{property.project}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{property.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">{formatCurrency(property.price, property.currency)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <h4 className="font-medium text-gray-900">Your Information</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{watchedValues.customer_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{watchedValues.customer_email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{watchedValues.customer_phone}</span>
                          </div>
                          {watchedValues.customer_nationality && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nationality:</span>
                              <span className="font-medium">{watchedValues.customer_nationality}</span>
                            </div>
                          )}
                          {watchedValues.viewing_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Viewing Date:</span>
                              <span className="font-medium">
                                {new Date(watchedValues.viewing_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {watchedValues.preferred_contact_time && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contact Time:</span>
                              <span className="font-medium">{watchedValues.preferred_contact_time}</span>
                            </div>
                          )}
                          {(watchedValues.budget_min || watchedValues.budget_max) && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Budget:</span>
                              <span className="font-medium">
                                {watchedValues.budget_min && `${watchedValues.budget_min.toLocaleString()} BHD`}
                                {watchedValues.budget_min && watchedValues.budget_max && ' - '}
                                {watchedValues.budget_max && `${watchedValues.budget_max.toLocaleString()} BHD`}
                              </span>
                            </div>
                          )}
                          {watchedValues.financing_needed && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Financing:</span>
                              <span className="font-medium">Interested in financing options</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• This reservation is non-binding and requires no upfront payment</li>
                        <li>• Our sales team will contact you within 24 hours to confirm details</li>
                        <li>• You can modify or cancel your reservation at any time</li>
                        <li>• A viewing appointment will be scheduled at your convenience</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {step > 1 && (
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="ghost" onClick={handleClose}>
                      Cancel
                    </Button>
                    {step < 3 ? (
                      <Button 
                        onClick={nextStep}
                        disabled={!isStepValid(step)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="submit"
                        loading={loading}
                        disabled={!isValid}
                      >
                        {loading ? 'Submitting...' : 'Confirm Reservation'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReservationForm