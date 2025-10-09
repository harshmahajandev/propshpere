import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Phone, 
  Mail, 
  Star,
  Check,
  Image as ImageIcon,
  FileText,
  Heart,
  Share2
} from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ReservationForm from '@/components/reservations/ReservationForm'
import ImageGallery from '@/components/properties/ImageGallery'
import { formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { currentProperty, loading, fetchProperty } = usePropertyStore()
  const { user } = useAuthStore()
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProperty(id)
    }
  }, [id])

  const handleShare = async () => {
    if (navigator.share && currentProperty) {
      try {
        await navigator.share({
          title: currentProperty.title,
          text: `Check out this property: ${currentProperty.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleReservation = () => {
    if (!user) {
      toast.error('Please sign in to make a reservation')
      return
    }
    setShowReservationForm(true)
  }

  if (loading || !currentProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading property details..." />
      </div>
    )
  }

  const property = currentProperty
  const isAvailable = property.status === 'available' && property.available_units > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <img
                  src={property.images?.[0] || '/placeholder-property.jpg'}
                  alt={property.title}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowImageGallery(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-property.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={cn(
                    'p-2 rounded-full backdrop-blur-sm transition-colors',
                    isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
                  )}
                >
                  <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full',
                  property.status === 'available' ? 'bg-green-100 text-green-800' :
                  property.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>
              
              {/* Image Gallery Button */}
              {property.images && property.images.length > 1 && (
                <button
                  onClick={() => setShowImageGallery(true)}
                  className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors flex items-center"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {property.images.length} Photos
                </button>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                      <p className="text-xl text-blue-600 font-semibold mb-2">{property.project}</p>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(property.price, property.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.available_units}/{property.total_units} units available
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    {property.bedrooms && (
                      <div className="text-center">
                        <Bed className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                        <div className="text-sm text-gray-500">Bedroom{property.bedrooms > 1 ? 's' : ''}</div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="text-center">
                        <Bath className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                        <div className="text-sm text-gray-500">Bathroom{property.bathrooms > 1 ? 's' : ''}</div>
                      </div>
                    )}
                    {property.size && (
                      <div className="text-center">
                        <Square className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-900">{property.size}</div>
                        <div className="text-sm text-gray-500">Square Meters</div>
                      </div>
                    )}
                    <div className="text-center">
                      <Star className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="font-semibold text-gray-900">{property.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-500">Property Type</div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {property.description || 'No description available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reservation Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="sticky top-8">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isAvailable ? 'Reserve This Property' : 'Property Unavailable'}
                  </h3>
                  {isAvailable && (
                    <p className="text-sm text-gray-600">
                      Secure your preferred unit with a reservation
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  {isAvailable ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Available for Reservation</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          {property.available_units} of {property.total_units} units remaining
                        </p>
                      </div>
                      
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleReservation}
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Make Reservation
                      </Button>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          No commitment required • Free consultation
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-red-800 font-medium">Currently Unavailable</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          This property is {property.status}. Contact us for alternatives.
                        </p>
                      </div>
                      
                      <Button variant="outline" className="w-full" size="lg">
                        <Mail className="h-5 w-5 mr-2" />
                        Contact Sales Team
                      </Button>
                    </div>
                  )}
                  
                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>+973 1234 5678</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>sales@diyar.bh</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Property ID:</span>
                      <span className="font-medium">{property.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project:</span>
                      <span className="font-medium">{property.project}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{property.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={cn(
                        'font-medium',
                        property.status === 'available' ? 'text-green-600' :
                        property.status === 'reserved' ? 'text-yellow-600' :
                        'text-red-600'
                      )}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <ReservationForm
          property={property}
          isOpen={showReservationForm}
          onClose={() => setShowReservationForm(false)}
        />
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && property.images && (
        <ImageGallery
          images={property.images}
          initialIndex={selectedImageIndex}
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  )
}

export default PropertyDetailPage