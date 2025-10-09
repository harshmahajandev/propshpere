import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { useLeadStore } from '../store/leadStore'
import { toast } from '../components/ui/Toaster'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface RegistrationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredLanguage: 'en' | 'ar'
  budgetMin: number
  budgetMax: number
  propertyInterest: string[]
  buyerType: 'first_time' | 'investor' | 'upgrading'
  timeline: 'immediate' | '3-6_months' | '6-12_months' | '12+_months'
}

const budgetRanges = [
  { label: 'Under 100K BHD', min: 0, max: 100000 },
  { label: '100K - 300K BHD', min: 100000, max: 300000 },
  { label: '300K - 500K BHD', min: 300000, max: 500000 },
  { label: '500K - 1M BHD', min: 500000, max: 1000000 },
  { label: '1M+ BHD', min: 1000000, max: 999999999 },
]

const propertyTypes = [
  { id: 'villa', label: 'Residential Villa', icon: '🏡' },
  { id: 'commercial', label: 'Commercial Property', icon: '🏢' },
  { id: 'plot', label: 'Land Plots', icon: '🏞️' },
  { id: 'investment', label: 'Investment Property', icon: '💼' },
]

const timelines = [
  { id: 'immediate', label: 'Immediately', icon: '⚡' },
  { id: '3-6_months', label: '3-6 months', icon: '📅' },
  { id: '6-12_months', label: '6-12 months', icon: '📆' },
  { id: '12+_months', label: '12+ months', icon: '🗓️' },
]

interface StepProps {
  isActive: boolean
  isCompleted: boolean
  title: string
  description: string
}

function Step({ isActive, isCompleted, title, description }: StepProps) {
  return (
    <div className={`flex items-center ${isActive ? 'text-diyar-blue' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
        isActive ? 'border-diyar-blue bg-diyar-blue text-white' :
        isCompleted ? 'border-green-600 bg-green-600 text-white' :
        'border-gray-300'
      }`}>
        {isCompleted ? (
          <CheckCircleIcon className="w-5 h-5" />
        ) : (
          <span className="text-sm font-medium">
            {isActive ? '●' : '○'}
          </span>
        )}
      </div>
      <div className="ml-3 min-w-0 flex-1">
        <p className={`text-sm font-medium ${isActive ? 'text-diyar-blue' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

export default function RapidRegistration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBudget, setSelectedBudget] = useState<any>(null)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  
  const { createLead, isLoading } = useLeadStore()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegistrationFormData>()

  const watchedValues = watch()

  const steps = [
    { title: 'Basic Info', description: 'Personal details' },
    { title: 'Preferences', description: 'Budget & interests' },
    { title: 'Timeline', description: 'Purchase timeline' },
    { title: 'AI Matching', description: 'Get recommendations' },
  ]

  const generateAiRecommendations = async (formData: RegistrationFormData) => {
    // Mock AI recommendations based on form data
    const mockRecommendations = [
      {
        id: '1',
        title: 'Al Bareh Villa #12',
        project: 'Al Bareh',
        match: 94,
        price: 185000,
        type: 'Villa',
        size: '183 sqm',
        reason: 'Perfect match for your budget and villa preference'
      },
      {
        id: '2',
        title: 'Suhail Commercial Plot #8',
        project: 'Suhail',
        match: 78,
        price: 125000,
        type: 'Commercial Plot',
        size: '400 sqm',
        reason: 'Great investment opportunity in growing area'
      },
      {
        id: '3',
        title: 'Jeewan Villa #5',
        project: 'Jeewan',
        match: 85,
        price: 220000,
        type: 'Villa',
        size: '250 sqm',
        reason: 'Premium villa matching your timeline'
      }
    ]
    
    setAiRecommendations(mockRecommendations)
    setShowRecommendations(true)
  }

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      // Determine buyer type based on selections
      let buyerType: 'hni' | 'investor' | 'retail' = 'retail'
      if (data.budgetMax >= 500000) buyerType = 'hni'
      else if (data.propertyInterest.includes('investment') || data.propertyInterest.includes('commercial')) buyerType = 'investor'

      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        preferredLanguage: data.preferredLanguage,
        buyerType,
        budget: {
          min: selectedBudget?.min || data.budgetMin,
          max: selectedBudget?.max || data.budgetMax,
          currency: 'BHD' as const
        },
        propertyInterest: data.propertyInterest,
        timeline: data.timeline,
        status: 'prospect' as const,
        source: 'website' as const,
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      }

      await createLead(leadData)
      await generateAiRecommendations(data)
      
      toast({
        type: 'success',
        title: 'Registration Complete!',
        message: 'Your profile has been created and property recommendations are ready'
      })
      
      setCurrentStep(4)
    } catch (error) {
      toast({
        type: 'error',
        title: 'Registration Failed',
        message: 'Please try again or contact support'
      })
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-diyar-light to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <img
            className="h-12 w-auto mx-auto mb-4"
            src="/diyar-logo.svg"
            alt="Diyar"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Property
          </h1>
          <p className="text-lg text-gray-600">
            Quick registration for personalized property recommendations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  isActive={currentStep === index + 1}
                  isCompleted={currentStep > index + 1}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">
                      <EnvelopeIcon className="inline h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      type="tel"
                      className="form-input"
                      placeholder="+973 XXXX XXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="form-label">Preferred Language</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          {...register('preferredLanguage')}
                          type="radio"
                          value="en"
                          defaultChecked
                          className="mr-2"
                        />
                        English
                      </label>
                      <label className="flex items-center">
                        <input
                          {...register('preferredLanguage')}
                          type="radio"
                          value="ar"
                          className="mr-2"
                        />
                        العربية
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Preferences & Budget
                </h2>
                
                {/* Budget Selection */}
                <div className="mb-8">
                  <label className="form-label">
                    <CurrencyDollarIcon className="inline h-4 w-4 mr-2" />
                    Investment Budget
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetRanges.map((range, index) => (
                      <motion.button
                        key={index}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedBudget(range)
                          setValue('budgetMin', range.min)
                          setValue('budgetMax', range.max)
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedBudget?.label === range.label
                            ? 'border-diyar-blue bg-blue-50 text-diyar-blue'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{range.label}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {range.min.toLocaleString()} - {range.max === 999999999 ? '∞' : range.max.toLocaleString()} BHD
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Property Interest */}
                <div className="mb-8">
                  <label className="form-label">
                    <HomeIcon className="inline h-4 w-4 mr-2" />
                    Property Interest
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertyTypes.map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          {...register('propertyInterest')}
                          type="checkbox"
                          value={type.id}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-3">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Buyer Type */}
                <div>
                  <label className="form-label">Buyer Type</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        {...register('buyerType')}
                        type="radio"
                        value="first_time"
                        defaultChecked
                        className="mr-2"
                      />
                      First-time Buyer
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('buyerType')}
                        type="radio"
                        value="investor"
                        className="mr-2"
                      />
                      Investor
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('buyerType')}
                        type="radio"
                        value="upgrading"
                        className="mr-2"
                      />
                      Upgrading
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Timeline */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Purchase Timeline
                </h2>
                
                <div className="mb-6">
                  <label className="form-label">
                    <ClockIcon className="inline h-4 w-4 mr-2" />
                    When are you looking to purchase?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timelines.map((timeline) => (
                      <label
                        key={timeline.id}
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          {...register('timeline', { required: 'Please select a timeline' })}
                          type="radio"
                          value={timeline.id}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-3">{timeline.icon}</span>
                        <span className="font-medium">{timeline.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.timeline && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeline.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex">
                    <SparklesIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">
                        AI Preference Analysis Ready
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Our AI will analyze your preferences and recommend the best properties for you.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: AI Recommendations */}
            {currentStep === 4 && showRecommendations && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🤖 AI Property Recommendations
                </h2>
                
                <div className="space-y-4">
                  {aiRecommendations.map((rec) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {rec.title}
                            </h3>
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {rec.match}% match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {rec.project} • {rec.type} • {rec.size}
                          </p>
                          <p className="text-lg font-bold text-diyar-blue mb-2">
                            {rec.price.toLocaleString()} BHD
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Why it's perfect:</strong> {rec.reason}
                          </p>
                        </div>
                        <button className="ml-4 btn-primary">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button className="btn-gold mr-4">
                    Schedule Site Visit
                  </button>
                  <button className="btn-secondary">
                    Get More Recommendations
                  </button>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="px-8 py-6 bg-gray-50 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                )}
                
                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          Get AI Recommendations
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}