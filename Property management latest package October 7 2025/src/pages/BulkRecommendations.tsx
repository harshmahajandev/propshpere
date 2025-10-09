import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useLeadStore } from '../store/leadStore'
import { usePropertyStore } from '../store/propertyStore'
import { toast } from '../components/ui/Toaster'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface CampaignBuilderProps {
  onSendCampaign: (data: any) => void
  isLoading: boolean
}

function CampaignBuilder({ onSendCampaign, isLoading }: CampaignBuilderProps) {
  const [selectedSegment, setSelectedSegment] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [messageTemplate, setMessageTemplate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  
  const { leads } = useLeadStore()
  const { properties } = usePropertyStore()

  const segments = [
    { id: 'hni', label: 'HNI Investors', icon: '💎', count: leads.filter(l => l.buyerType === 'hni').length },
    { id: 'investor', label: 'Investors', icon: '💼', count: leads.filter(l => l.buyerType === 'investor').length },
    { id: 'retail', label: 'Retail Buyers', icon: '🏠', count: leads.filter(l => l.buyerType === 'retail').length },
    { id: 'high_score', label: 'High Score Leads', icon: '⭐', count: leads.filter(l => l.score >= 80).length },
  ]

  const messageTemplates = {
    premium_investment: `Dear {firstName},

Based on your investment profile, we have identified an exclusive opportunity in our latest {projectName} development.

🏗️ Project: {projectName}
💰 Starting Price: {price} BHD
📍 Location: {location}
⏰ Limited availability - Only {availableUnits} units remaining

This premium {propertyType} offers exceptional ROI potential with our proven track record of delivering high-value properties in Bahrain's most sought-after locations.

Schedule a private viewing: {scheduleLink}

Best regards,
Diyar Sales Team`,

    family_home: `Hello {firstName},

We found the perfect family home that matches your requirements!

🏡 Property: {propertyTitle}
🛏️ Specifications: {bedrooms} bedrooms, {bathrooms} bathrooms
📐 Size: {size} sqm
💰 Price: {price} BHD

This beautiful {propertyType} in {location} offers the ideal setting for your family, with modern amenities and excellent connectivity.

Would you like to schedule a viewing?

Warm regards,
Diyar Sales Team`,

    commercial_opportunity: `Dear {firstName},

Exciting commercial investment opportunity just became available!

🏢 Property: {propertyTitle}
💼 Type: {propertyType}
📈 Expected ROI: High potential
💰 Investment: {price} BHD

Prime location with excellent foot traffic and growth potential. Perfect for your commercial portfolio expansion.

Contact us for detailed investment analysis.

Best regards,
Diyar Commercial Team`
  }

  const getFilteredLeads = () => {
    let filtered = leads
    
    if (selectedSegment === 'hni') {
      filtered = leads.filter(l => l.buyerType === 'hni')
    } else if (selectedSegment === 'investor') {
      filtered = leads.filter(l => l.buyerType === 'investor')
    } else if (selectedSegment === 'retail') {
      filtered = leads.filter(l => l.buyerType === 'retail')
    } else if (selectedSegment === 'high_score') {
      filtered = leads.filter(l => l.score >= 80)
    }
    
    return filtered
  }

  const getReachEstimate = () => {
    const filteredLeads = getFilteredLeads()
    return Math.floor(filteredLeads.length * 0.85) // 85% estimated reach
  }

  const getBestSendTime = () => {
    return 'Tuesday 10:00 AM' // Mock AI-optimized time
  }

  const handleSendCampaign = () => {
    const filteredLeads = getFilteredLeads()
    
    if (!selectedSegment) {
      toast({ type: 'error', title: 'Please select a target segment' })
      return
    }
    
    if (selectedProperties.length === 0) {
      toast({ type: 'error', title: 'Please select at least one property' })
      return
    }
    
    if (!messageTemplate.trim()) {
      toast({ type: 'error', title: 'Please enter a message template' })
      return
    }

    const campaignData = {
      leadIds: filteredLeads.map(l => l.id),
      propertyIds: selectedProperties,
      messageTemplate,
      scheduledTime: scheduledTime || 'immediate',
      segment: selectedSegment
    }

    onSendCampaign(campaignData)
  }

  return (
    <div className="space-y-6">
      {/* Segment Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Target Segment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map((segment) => (
            <motion.button
              key={segment.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSegment(segment.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSegment === segment.id
                  ? 'border-diyar-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{segment.icon}</span>
                <span className={`text-lg font-bold ${
                  selectedSegment === segment.id ? 'text-diyar-blue' : 'text-gray-600'
                }`}>
                  {segment.count}
                </span>
              </div>
              <div className="font-medium text-gray-900">{segment.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Property Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select Properties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.slice(0, 6).map((property) => (
            <label
              key={property.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProperties.includes(property.id)
                  ? 'border-diyar-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedProperties.includes(property.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProperties([...selectedProperties, property.id])
                  } else {
                    setSelectedProperties(selectedProperties.filter(id => id !== property.id))
                  }
                }}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{property.title}</div>
                <div className="text-sm text-gray-600">{property.project}</div>
                <div className="text-sm font-medium text-diyar-blue">
                  {property.price.toLocaleString()} {property.currency}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Message Template */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Message Template
          </h3>
          <div className="flex space-x-2">
            <select
              onChange={(e) => setMessageTemplate(messageTemplates[e.target.value as keyof typeof messageTemplates] || '')}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="">Choose Template</option>
              <option value="premium_investment">Premium Investment</option>
              <option value="family_home">Family Home</option>
              <option value="commercial_opportunity">Commercial Opportunity</option>
            </select>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        
        {previewMode ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Preview (with sample data):</div>
            <div className="whitespace-pre-line text-sm">
              {messageTemplate.replace(/{(\w+)}/g, (match, key) => {
                const sampleData: Record<string, string> = {
                  firstName: 'Ahmed',
                  projectName: 'Al Bareh',
                  price: '185,000',
                  location: 'Al Muharraq',
                  availableUnits: '12',
                  propertyType: 'villa',
                  propertyTitle: 'Al Bareh Villa #12',
                  bedrooms: '3',
                  bathrooms: '2',
                  size: '183',
                  scheduleLink: 'https://diyar.bh/schedule'
                }
                return sampleData[key] || match
              })}
            </div>
          </div>
        ) : (
          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Enter your message template... Use {firstName}, {projectName}, {price}, etc. for personalization"
          />
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          Available variables: {'{firstName}'}, {'{lastName}'}, {'{projectName}'}, {'{price}'}, {'{location}'}, {'{propertyType}'}, {'{bedrooms}'}, {'{bathrooms}'}, {'{size}'}
        </div>
      </div>

      {/* Campaign Summary & Send */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Campaign Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-diyar-blue mr-3" />
              <div>
                <div className="text-lg font-bold text-diyar-blue">
                  {getFilteredLeads().length}
                </div>
                <div className="text-sm text-gray-600">Recipients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round((getReachEstimate() / getFilteredLeads().length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Est. Reach ({getReachEstimate()} contacts)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {getBestSendTime()}
                </div>
                <div className="text-sm text-gray-600">Best Send Time</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scheduling */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Campaign
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!scheduledTime}
                onChange={() => setScheduledTime('')}
                className="mr-2"
              />
              Send Now
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!!scheduledTime}
                onChange={() => setScheduledTime('2024-01-15T10:00')}
                className="mr-2"
              />
              Schedule for Later
            </label>
          </div>
          {scheduledTime && (
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-2 border border-gray-300 rounded px-3 py-2"
            />
          )}
        </div>
        
        <button
          onClick={handleSendCampaign}
          disabled={isLoading || !selectedSegment || selectedProperties.length === 0}
          className="w-full bg-diyar-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Sending Campaign...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              {scheduledTime ? 'Schedule Campaign' : 'Send Campaign Now'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

interface CampaignResultsProps {
  results: any
  onReset: () => void
}

function CampaignResults({ results, onReset }: CampaignResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="text-center mb-6">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Sent Successfully!
        </h2>
        <p className="text-gray-600">
          Your bulk recommendations have been delivered to the selected recipients.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {results.sent}
          </div>
          <div className="text-sm text-gray-600">Successfully Sent</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-3xl font-bold text-red-600">
            {results.failed}
          </div>
          <div className="text-sm text-gray-600">Failed to Send</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-diyar-blue">
            {Math.round((results.sent / (results.sent + results.failed)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onReset}
          className="btn-primary"
        >
          Send Another Campaign
        </button>
        <button className="btn-secondary">
          View Campaign Analytics
        </button>
      </div>
    </motion.div>
  )
}

export default function BulkRecommendations() {
  const [campaignResults, setCampaignResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { leads, fetchLeads } = useLeadStore()
  const { properties, fetchProperties } = usePropertyStore()

  useEffect(() => {
    fetchLeads()
    fetchProperties()
  }, [])

  const handleSendCampaign = async (campaignData: any) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results
      const sent = Math.floor(Math.random() * 10) + campaignData.leadIds.length - 5
      const failed = campaignData.leadIds.length - sent
      
      setCampaignResults({
        sent: Math.max(sent, 0),
        failed: Math.max(failed, 0),
        details: []
      })
      
      toast({
        type: 'success',
        title: 'Campaign Sent!',
        message: `Successfully sent recommendations to ${sent} recipients`
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Campaign Failed',
        message: 'There was an error sending your campaign'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCampaignResults(null)
  }

  if (campaignResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Results</h1>
            <p className="mt-1 text-sm text-gray-600">
              View the results of your bulk recommendation campaign
            </p>
          </div>
        </div>
        
        <CampaignResults results={campaignResults} onReset={handleReset} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Recommendations</h1>
          <p className="mt-1 text-sm text-gray-600">
            Send personalized property recommendations to targeted buyer segments
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{leads.length}</span> Total Leads
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{properties.length}</span> Properties
          </div>
        </div>
      </div>

      <CampaignBuilder 
        onSendCampaign={handleSendCampaign}
        isLoading={isLoading}
      />
    </div>
  )
}