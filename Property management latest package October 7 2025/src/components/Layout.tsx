import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  MapIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/auth-store'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Business Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Customer Management', href: '/customer-management', icon: UserGroupIcon },
  { name: 'Financial Reports', href: '/financial-reports', icon: CurrencyDollarIcon },
  { name: 'Reservations', href: '/reservations', icon: CalendarIcon },
  { name: 'Unit Availability', href: '/unit-availability', icon: ClipboardDocumentListIcon },
  { name: 'Property Map', href: '/property-map', icon: MapIcon },
  { name: 'Interactive Map', href: '/interactive-map', icon: MapIcon },
  { name: 'Villa Map', href: '/villa-map', icon: MapIcon },
  { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
  { name: 'Bulk Recommendations', href: '/bulk-recommendations', icon: EnvelopeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <img
              className="h-8 w-auto"
              src="/diyar-logo.svg"
              alt="Diyar"
            />
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--primary-blue)' } : {}}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 flex-shrink-0 items-center px-4 diyar-gradient">
            <img
              className="h-8 w-auto filter brightness-0 invert"
              src="/diyar-logo.svg"
              alt="Diyar"
            />
            <span className="ml-2 text-white font-bold text-lg">Business Suite</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-all duration-200 ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--primary-blue)' } : {}}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            {/* User menu */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-blue)' }}>
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  className="group flex w-full items-center px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              
              {/* Page title */}
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-red-600">3</span>
                </div>
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}