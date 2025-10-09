import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { useLeadStore } from '../store/leadStore'
import { usePropertyStore } from '../store/propertyStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<any>
  color: string
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow p-6 card-hover"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${ 
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change.value)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

function LeadsOverTimeChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Leads',
        data: [12, 19, 15, 25, 22, 30, 35, 28, 32, 40, 38, 45],
        borderColor: '#1E40AF',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Converted Leads',
        data: [3, 5, 4, 6, 5, 8, 9, 7, 8, 10, 9, 12],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Leads Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Line data={data} options={options} />
    </div>
  )
}

function PropertyPerformanceChart() {
  const data = {
    labels: ['Al Bareh', 'Suhail', 'Jeewan', 'Al Naseem', 'Mozoon', 'Al Qamra'],
    datasets: [
      {
        label: 'Interest Score',
        data: [85, 78, 92, 88, 75, 82],
        backgroundColor: [
          '#1E40AF',
          '#F59E0B',
          '#10B981',
          '#EF4444',
          '#8B5CF6',
          '#F97316',
        ],
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Property Interest Scores by Project',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Bar data={data} options={options} />
    </div>
  )
}

function BuyerSegmentChart() {
  const data = {
    labels: ['HNI Investors', 'Regular Investors', 'Retail Buyers'],
    datasets: [
      {
        data: [25, 35, 40],
        backgroundColor: ['#F59E0B', '#1E40AF', '#10B981'],
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Buyer Segment Distribution',
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Doughnut data={data} options={options} />
    </div>
  )
}

function ConversionFunnelChart() {
  const data = {
    labels: ['Prospects', 'Contacted', 'Viewing', 'Negotiation', 'Closed'],
    datasets: [
      {
        label: 'Leads',
        data: [245, 189, 145, 89, 45],
        backgroundColor: '#1E40AF',
        borderColor: '#1E40AF',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Sales Funnel Conversion',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Bar data={data} options={options} />
    </div>
  )
}

function TopPropertiesTable() {
  const properties = [
    { name: 'Al Bareh Villa #12', project: 'Al Bareh', views: 234, leads: 45, score: 94 },
    { name: 'Jeewan Villa #5', project: 'Jeewan', views: 189, leads: 38, score: 88 },
    { name: 'Suhail Plot #8', project: 'Suhail', views: 156, leads: 29, score: 82 },
    { name: 'Al Naseem Villa #3', project: 'Al Naseem', views: 145, leads: 31, score: 79 },
    { name: 'Mozoon Plot #15', project: 'Mozoon', views: 134, leads: 25, score: 76 },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Top Performing Properties</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{property.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{property.project}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{property.views}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{property.leads}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.score >= 90 ? 'bg-green-100 text-green-800' :
                    property.score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.score}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-diyar-blue hover:text-blue-700">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('3months')
  const [isLoading, setIsLoading] = useState(true)
  
  const { leads } = useLeadStore()
  const { properties } = usePropertyStore()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  // Calculate metrics
  const totalLeads = leads.length
  const totalProperties = properties.length
  const avgConversionRate = 24.5 // Mock data
  const monthlyRevenue = 2400000 // Mock data

  const conversions = leads.filter(l => l.status === 'closed').length
  const actualConversionRate = totalLeads > 0 ? Math.round((conversions / totalLeads) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track performance and gain insights into your sales and properties
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={totalLeads}
          change={{ value: 12, type: 'increase' }}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <MetricCard
          title="Active Properties"
          value={totalProperties}
          change={{ value: 5, type: 'increase' }}
          icon={BuildingOfficeIcon}
          color="bg-green-500"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`${(monthlyRevenue / 1000000).toFixed(1)}M BHD`}
          change={{ value: 18, type: 'increase' }}
          icon={CurrencyDollarIcon}
          color="bg-diyar-gold"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${actualConversionRate}%`}
          change={{ value: 2.3, type: 'increase' }}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsOverTimeChart />
        <PropertyPerformanceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnelChart />
        <BuyerSegmentChart />
      </div>

      {/* Top Properties Table */}
      <TopPropertiesTable />

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          🤖 AI-Powered Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2">🎯 Best Performing Segment</h4>
            <p className="text-sm text-gray-700">
              HNI investors show 34% higher conversion rates. Focus marketing efforts on this segment.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-green-800 mb-2">📈 Trending Properties</h4>
            <p className="text-sm text-gray-700">
              Al Bareh project has 89% interest uptick. Consider increasing inventory allocation.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-purple-800 mb-2">⏰ Optimal Contact Time</h4>
            <p className="text-sm text-gray-700">
              Tuesday 10:00 AM shows highest response rates. Schedule bulk campaigns accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}