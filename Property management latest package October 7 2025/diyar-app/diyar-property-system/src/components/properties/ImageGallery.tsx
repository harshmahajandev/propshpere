import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsZoomed(false)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsZoomed(false)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    setIsZoomed(false)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = images[currentIndex]
    link.download = `property-image-${currentIndex + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <div className="text-white">
            <span className="text-lg font-medium">
              {currentIndex + 1} of {images.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleZoom}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative flex-1 flex items-center justify-center px-16">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: isZoomed ? 1.5 : 1 
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            className={cn(
              'max-w-full max-h-full object-contain cursor-pointer transition-transform',
              isZoomed && 'cursor-zoom-out'
            )}
            onClick={toggleZoom}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-property.jpg'
            }}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                title="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                title="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-property.jpg'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}

export default ImageGallery