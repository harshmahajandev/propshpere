import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/auth-store'

// Layout Components
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Pages
import HomePage from '@/pages/HomePage'
import PropertiesPage from '@/pages/PropertiesPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import ReservationsPage from '@/pages/ReservationsPage'
import DashboardPage from '@/pages/DashboardPage'
import AuthPage from '@/pages/AuthPage'
import CustomerManagementPage from '@/pages/CustomerManagementPage'
import FinancialReportsPage from '@/pages/FinancialReportsPage'
import UnitAvailabilityPage from '@/pages/UnitAvailabilityPage'
import { 
  ReservationDetailPage, 
  LeadsPage, 
  CampaignsPage, 
  AnalyticsPage, 
  ProfilePage 
} from '@/pages/PlaceholderPages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const isAdmin = user && ['admin', 'sales_manager', 'sales_rep'].includes(user.role)

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}

function App() {
  const { user, loading, getCurrentUser } = useAuthStore()

  useEffect(() => {
    getCurrentUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading Diyar Property Management..." />
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/properties" element={<AppLayout><PropertiesPage /></AppLayout>} />
          <Route path="/properties/:id" element={<AppLayout><PropertyDetailPage /></AppLayout>} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Customer Routes */}
          {user && (
            <>
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
              <Route path="/my-reservations" element={<AppLayout><ReservationsPage /></AppLayout>} />
            </>
          )}
          
          {/* Admin/Staff Routes */}
          {user && ['admin', 'sales_manager', 'sales_rep'].includes(user.role) && (
            <>
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/admin/properties" element={<AppLayout><PropertiesPage /></AppLayout>} />
              <Route path="/unit-availability" element={<AppLayout><UnitAvailabilityPage /></AppLayout>} />
              <Route path="/admin/reservations" element={<AppLayout><ReservationsPage /></AppLayout>} />
              <Route path="/admin/reservations/:id" element={<AppLayout><ReservationDetailPage /></AppLayout>} />
              <Route path="/customer-management" element={<AppLayout><CustomerManagementPage /></AppLayout>} />
              <Route path="/financial-reports" element={<AppLayout><FinancialReportsPage /></AppLayout>} />
              <Route path="/admin/leads" element={<AppLayout><LeadsPage /></AppLayout>} />
              <Route path="/admin/campaigns" element={<AppLayout><CampaignsPage /></AppLayout>} />
              <Route path="/admin/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
            </>
          )}
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  )
}

export default App