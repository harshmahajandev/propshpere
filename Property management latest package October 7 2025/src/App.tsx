import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import Properties from './pages/Properties'
import VillaMapPage from './pages/VillaMapPage'
import InteractiveMapPage from './pages/InteractiveMapPage'
import PropertyMapPage from './pages/PropertyMapPage'
import Leads from './pages/Leads'
import BulkRecommendations from './pages/BulkRecommendations'
import RapidRegistration from './pages/RapidRegistration'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import CustomerManagementPage from './pages/CustomerManagementPage'
import FinancialReportsPage from './pages/FinancialReportsPage'
import ReservationsPage from './pages/ReservationsPage'
import UnitAvailabilityPage from './pages/UnitAvailabilityPage'
import { useAuthStore } from './stores/auth-store'
import { Toaster } from './components/ui/Toaster'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { user, loading, getCurrentUser } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      await getCurrentUser()
      setInitializing(false)
    }
    initializeApp()
  }, [])

  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-diyar-light">
        <LoadingSpinner size="lg" text="Initializing Diyar CRM..." />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Router>
          <Routes>
            <Route path="/register" element={<RapidRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<BusinessDashboard />} />
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/customer-management" element={<CustomerManagementPage />} />
            <Route path="/financial-reports" element={<FinancialReportsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/unit-availability" element={<UnitAvailabilityPage />} />
            <Route path="/villa-map" element={<VillaMapPage />} />
            <Route path="/interactive-map" element={<InteractiveMapPage />} />
            <Route path="/property-map" element={<PropertyMapPage />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/bulk-recommendations" element={<BulkRecommendations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/register" element={<RapidRegistration />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </>
  )
}

export default App