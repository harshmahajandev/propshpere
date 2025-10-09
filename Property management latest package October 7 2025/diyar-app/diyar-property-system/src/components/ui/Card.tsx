import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const cardVariants = {
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }
  }

  return (
    <motion.div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hover && 'cursor-pointer',
        className
      )}
      variants={cardVariants}
      whileHover={hover ? 'hover' : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
    {children}
  </div>
)

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
    {children}
  </h3>
)

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
)

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
)

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('px-6 py-4 border-t border-gray-200', className)}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }