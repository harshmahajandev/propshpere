import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Building, 
  Calendar, 
  Users, 
  TrendingUp, 
  Mail,
  Settings,
  HelpCircle,
  DollarSign,
  UserCheck,
  Grid3x3
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const Sidebar = () => {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user || !['admin', 'sales_manager', 'sales_rep'].includes(user.role)) {
    return null
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      name: 'Properties',
      href: '/admin/properties',
      icon: Building,
      description: 'Manage property listings'
    },
    {
      name: 'Unit Availability',
      href: '/admin/unit-availability',
      icon: Grid3x3,
      description: 'Real-time unit status'
    },
    {
      name: 'Reservations',
      href: '/admin/reservations',
      icon: Calendar,
      description: 'Customer reservations'
    },
    {
      name: 'Customer Management',
      href: '/admin/customers',
      icon: UserCheck,
      description: 'Customer profiles & CRM'
    },
    {
      name: 'Financial Reports',
      href: '/admin/financial-reports',
      icon: DollarSign,
      description: 'Revenue & analytics'
    },
    {
      name: 'Leads',
      href: '/admin/leads',
      icon: Users,
      description: 'Lead management'
    },
    {
      name: 'Campaigns',
      href: '/admin/campaigns',
      icon: Mail,
      description: 'Bulk recommendations'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      description: 'Reports and insights'
    },
  ]

  const secondaryNavigation = [
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      name: 'Help',
      href: '/admin/help',
      icon: HelpCircle,
    },
  ]

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar