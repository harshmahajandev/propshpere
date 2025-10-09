import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';

interface BulkRecommendationsProps {
  onClose?: () => void;
  onComplete?: (recommendations: any) => void;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: string[];
}

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  bedrooms: number;
  project: string;
  status: string;
}

interface RecommendationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const BulkRecommendations: React.FC<BulkRecommendationsProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock data for customer segments
  const customerSegments: CustomerSegment[] = [
    {
      id: 'hni',
      name: 'High Net Worth Individuals (HNI)',
      description: 'Customers with budget >BD 500K looking for luxury properties',
      count: 45,
      criteria: ['Budget >BD 500K', 'Luxury preferences', 'Premium locations']
    },
    {
      id: 'investor',
      name: 'Property Investors',
      description: 'Customers interested in investment properties and ROI analysis',
      count: 78,
      criteria: ['Multiple property interest', 'ROI focused', 'Rental potential']
    },
    {
      id: 'retail',
      name: 'Retail Buyers',
      description: 'First-time buyers and families looking for residential properties',
      count: 156,
      criteria: ['First-time buyers', 'Family-focused', 'Financing needs']
    },
    {
      id: 'previous',
      name: 'Previous Customers',
      description: 'Existing customers who might be interested in additional properties',
      count: 32,
      criteria: ['Existing customers', 'Loyalty program eligible', 'Upgrade potential']
    }
  ];

  // Mock data for available properties
  const availableProperties: Property[] = [
    {
      id: '1',
      title: 'Luxury Waterfront Villa',
      price: 750000,
      type: 'Villa',
      bedrooms: 5,
      project: 'Marina District',
      status: 'available'
    },
    {
      id: '2',
      title: 'Modern Family Villa',
      price: 450000,
      type: 'Villa',
      bedrooms: 4,
      project: 'Diyar Al Muharraq',
      status: 'available'
    },
    {
      id: '3',
      title: 'Investment Apartment',
      price: 280000,
      type: 'Apartment',
      bedrooms: 2,
      project: 'Business Bay',
      status: 'available'
    },
    {
      id: '4',
      title: 'Golf Course Villa',
      price: 950000,
      type: 'Villa',
      bedrooms: 6,
      project: 'Golf Resort Island',
      status: 'available'
    },
    {
      id: '5',
      title: 'Beachfront Apartment',
      price: 320000,
      type: 'Apartment',
      bedrooms: 3,
      project: 'Beach Resort Complex',
      status: 'available'
    }
  ];

  // Recommendation templates
  const templates: RecommendationTemplate[] = [
    {
      id: 'luxury',
      name: 'Luxury Properties',
      subject: 'Exclusive Luxury Properties - Limited Availability',
      content: `Dear {{customerName}},

We are pleased to present you with our exclusive selection of luxury properties that match your sophisticated preferences.

{{propertyDetails}}

These premium properties offer exceptional value and are perfect for discerning buyers like yourself.

Best regards,
Diyar Sales Team`
    },
    {
      id: 'investment',
      name: 'Investment Opportunities',
      subject: 'High-ROI Investment Opportunities Available',
      content: `Dear {{customerName}},

Based on your investment criteria, we have identified exceptional opportunities with strong ROI potential:

{{propertyDetails}}

These properties offer excellent rental yields and capital appreciation potential.

Let's discuss these opportunities at your convenience.

Best regards,
Diyar Investment Team`
    },
    {
      id: 'family',
      name: 'Family Properties',
      subject: 'Perfect Family Homes - Move-in Ready',
      content: `Dear {{customerName}},

We have found beautiful family homes that would be perfect for your needs:

{{propertyDetails}}

These properties are located in family-friendly communities with excellent amenities.

We'd love to arrange a viewing for you.

Warm regards,
Diyar Family Homes Team`
    }
  ];

  const handleSegmentToggle = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getTotalRecipients = () => {
    return selectedSegments.reduce((total, segmentId) => {
      const segment = customerSegments.find(s => s.id === segmentId);
      return total + (segment?.count || 0);
    }, 0);
  };

  const generatePreview = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    const properties = availableProperties.filter(p => selectedProperties.includes(p.id));
    
    if (!template) return '';

    const propertyDetails = properties.map(property => 
      `• ${property.title} - ${formatCurrency(property.price)}\n  ${property.bedrooms} bedrooms, ${property.type} in ${property.project}`
    ).join('\n\n');

    return template.content
      .replace('{{customerName}}', '[Customer Name]')
      .replace('{{propertyDetails}}', propertyDetails);
  };

  const handleSendRecommendations = async () => {
    setIsProcessing(true);
    setProgress(0);

    const totalRecipients = getTotalRecipients();
    const recommendations = {
      segments: selectedSegments,
      properties: selectedProperties,
      template: selectedTemplate,
      customMessage,
      recipients: totalRecipients,
      timestamp: new Date().toISOString()
    };

    // Simulate sending process with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    onComplete?.(recommendations);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-purple-600' : 'text-gray-600'
            }`}>
              Select Segments
            </div>
          </div>
          
          <div className={`flex-1 h-1 mx-4 rounded ${
            currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-purple-600' : 'text-gray-600'
            }`}>
              Select Properties
            </div>
          </div>
          
          <div className={`flex-1 h-1 mx-4 rounded ${
            currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 3 ? 'text-purple-600' : 'text-gray-600'
            }`}>
              Customize & Send
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Select Customer Segments */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Customer Segments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {customerSegments.map(segment => (
                <div
                  key={segment.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSegments.includes(segment.id)
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSegmentToggle(segment.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-purple-600">{segment.count} customers</span>
                      <input
                        type="checkbox"
                        checked={selectedSegments.includes(segment.id)}
                        onChange={() => handleSegmentToggle(segment.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.criteria.map(criterion => (
                      <span key={criterion} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {criterion}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedSegments.length} segments selected • {getTotalRecipients()} total recipients
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={selectedSegments.length === 0}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Select Properties
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Properties */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Select Properties to Recommend</h3>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                ← Back to Segments
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {availableProperties.map(property => (
                <div
                  key={property.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedProperties.includes(property.id)
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePropertyToggle(property.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handlePropertyToggle(property.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="text-lg font-semibold text-purple-600">{formatCurrency(property.price)}</div>
                    <div>{property.bedrooms} bed • {property.type}</div>
                    <div>{property.project}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedProperties.length} properties selected
              </div>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={selectedProperties.length === 0}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Customize Message
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customize and Send */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Customize & Send Recommendations</h3>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                ← Back to Properties
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Select Message Template</h4>
                <div className="space-y-3 mb-6">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                        </div>
                        <input
                          type="radio"
                          checked={selectedTemplate === template.id}
                          onChange={() => setSelectedTemplate(template.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Custom Message (Optional)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add any custom message or special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Message Preview</h4>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Subject:</div>
                        <div className="font-medium">{templates.find(t => t.id === selectedTemplate)?.subject}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Message:</div>
                        <div className="whitespace-pre-line text-sm">{generatePreview()}</div>
                      </div>
                      {customMessage && (
                        <div>
                          <div className="text-sm font-medium text-gray-600">Custom Addition:</div>
                          <div className="text-sm">{customMessage}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      Select a template to see preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Send Section */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Ready to Send</h4>
                  <p className="text-sm text-gray-600">
                    {getTotalRecipients()} recipients • {selectedProperties.length} properties • 
                    {selectedSegments.length} segments
                  </p>
                </div>
                <button
                  onClick={handleSendRecommendations}
                  disabled={!selectedTemplate || isProcessing}
                  className="bg-purple-600 text-white px-8 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending... {progress}%</span>
                    </>
                  ) : (
                    <span>Send Recommendations</span>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkRecommendations;