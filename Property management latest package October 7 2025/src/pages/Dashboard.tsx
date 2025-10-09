import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { useLeadStore } from '../store/leadStore'
import { usePropertyStore } from '../store/propertyStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<any>
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white overflow-hidden shadow rounded-lg card-hover"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change.type === 'increase' ? (
                      <TrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <TrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="ml-1">{Math.abs(change.value)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface ActivityItemProps {
  type: 'lead' | 'property' | 'campaign' | 'meeting'
  title: string
  description: string
  time: string
  priority?: 'high' | 'medium' | 'low'
}

function ActivityItem({ type, title, description, time, priority = 'medium' }: ActivityItemProps) {
  const typeColors = {
    lead: 'bg-blue-100 text-blue-600',
    property: 'bg-green-100 text-green-600',
    campaign: 'bg-purple-100 text-purple-600',
    meeting: 'bg-orange-100 text-orange-600',
  }

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-l-4 ${priorityColors[priority]} bg-white p-4 hover:bg-gray-50 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {time}
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mt-1">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <EyeIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadStore()
  const { properties, fetchProperties, isLoading: propertiesLoading } = usePropertyStore()

  useEffect(() => {
    fetchLeads()
    fetchProperties()
  }, [])

  // Calculate statistics
  const totalLeads = leads.length
  const activeProperties = properties.filter(p => p.status === 'available').length
  const totalRevenue = '2.4M' // This would come from actual sales data
  const conversionRate = '24.5'

  // Recent activities (mock data)
  const recentActivities = [
    {
      type: 'lead' as const,
      title: 'New HNI lead registered',
      description: 'Mohammed Al-Rashid - Interest in Al Bareh villas',
      time: '2 minutes ago',
      priority: 'high' as const,
    },
    {
      type: 'property' as const,
      title: 'Villa Al Bareh #23',
      description: 'Site visit scheduled for tomorrow at 2:00 PM',
      time: '15 minutes ago',
      priority: 'medium' as const,
    },
    {
      type: 'campaign' as const,
      title: 'Bulk recommendation sent',
      description: 'Suhail project recommended to 45 investors',
      time: '1 hour ago',
      priority: 'medium' as const,
    },
    {
      type: 'lead' as const,
      title: 'Commercial plot inquiry',
      description: 'Sarah Johnson asking about commercial opportunities',
      time: '2 hours ago',
      priority: 'high' as const,
    },
  ]

  if (leadsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-diyar-blue to-blue-600 rounded-2xl shadow-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your properties and leads today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-16 w-16 text-white/80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          change={{ value: 12, type: 'increase' }}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Listings"
          value={activeProperties}
          icon={BuildingOfficeIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`${totalRevenue} BHD`}
          change={{ value: 18, type: 'increase' }}
          icon={CurrencyDollarIcon}
          color="bg-diyar-gold"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          change={{ value: 2.3, type: 'increase' }}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activities
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  {...activity}
                />
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              🤖 AI Insights
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="text-sm">
                <p className="font-medium text-blue-800">
                  15 HNI prospects match Al Naseem villas
                </p>
                <p className="text-blue-700 mt-1">
                  High purchase probability detected
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="text-sm">
                <p className="font-medium text-green-800">
                  Investor segment shows 67% interest
                </p>
                <p className="text-green-700 mt-1">
                  in commercial properties
                </p>
              </div>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <div className="text-sm">
                <p className="font-medium text-purple-800">
                  Recommended: Send Suhail project
                </p>
                <p className="text-purple-700 mt-1">
                  to 23 qualified investors
                </p>
              </div>
            </div>
            
            <button className="w-full bg-diyar-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              View All Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}