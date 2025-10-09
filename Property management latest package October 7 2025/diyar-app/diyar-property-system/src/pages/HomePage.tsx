import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Building, Bed, Bath, Square, ArrowRight, Star, Filter } from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { formatCurrency, cn } from '@/lib/utils'

const HomePage = () => {
  const { properties, loading, fetchProperties, filters, setFilters } = usePropertyStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ search: term })
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    setFilters({ type })
  }

  const handleProjectFilter = (project: string) => {
    setSelectedProject(project)
    setFilters({ project })
  }

  const featuredProperties = properties.slice(0, 6)
  const propertyTypes = ['villa', 'apartment', 'commercial_plot', 'office']
  const projects = [...new Set(properties.map(p => p.project))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Dream Property
              <span className="block text-blue-300 mt-2">in Bahrain</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Premium real estate developments by Diyar Al Muharraq
            </p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg p-2 shadow-xl max-w-2xl mx-auto"
            >
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search properties, projects, or locations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <Button className="m-1">
                  Search
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
      </section>

      {/* Quick Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(selectedType === type ? '' : type)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our premium selection of properties across Bahrain's most desirable locations
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading properties..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card hover className="overflow-hidden h-full">
                    <div className="relative">
                      <img
                        src={property.images?.[0] || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-property.jpg'
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          property.status === 'available' ? 'bg-green-100 text-green-800' :
                          property.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
                          {formatCurrency(property.price, property.currency)}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                        <p className="text-sm text-blue-600 font-medium">{property.project}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        {property.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.bedrooms} bed
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.bathrooms} bath
                          </div>
                        )}
                        {property.size && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            {property.size} sqm
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {property.description}
                      </p>
                      
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/properties">
              <Button size="lg">
                View All Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover premium developments across Bahrain's most sought-after locations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project, index) => {
              const projectProperties = properties.filter(p => p.project === project)
              const projectProperty = projectProperties[0]
              
              return (
                <motion.div
                  key={project}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card hover className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={projectProperty?.images?.[0] || '/placeholder-property.jpg'}
                        alt={project}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-property.jpg'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{project}</h3>
                        <p className="text-sm opacity-90">{projectProperties.length} Properties</p>
                      </div>
                    </div>
                    
                    <CardContent>
                      <button
                        onClick={() => handleProjectFilter(project)}
                        className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Explore Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let our expert team help you discover the ideal investment opportunity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/properties">
                <Button size="lg" variant="secondary">
                  Browse All Properties
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage