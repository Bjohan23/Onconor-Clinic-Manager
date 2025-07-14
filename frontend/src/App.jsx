import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './shared/contexts/ThemeContext'
import { AuthProvider } from './shared/contexts/AuthContext'
import { AuthGuard } from './shared/guards/AuthGuard'
import { GuestGuard } from './shared/guards/AuthGuard'
import { LoginPage } from './auth/pages/LoginPage'
import { DashboardLayout } from './shared/components/DashboardLayout'

// Lazy loading de páginas
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './shared/components/LoadingSpinner'

const Dashboard = lazy(() => import('./dashboard/pages/DashboardPage'))
const Patients = lazy(() => import('./patients/pages/PatientsPage'))
const CreatePatient = lazy(() => import('./patients/pages/CreatePatientPage'))
const EditPatient = lazy(() => import('./patients/pages/EditPatientPage'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                <GuestGuard>
                  <LoginPage />
                </GuestGuard>
              } 
            />
            
            {/* Rutas protegidas */}
            <Route 
              path="/*" 
              element={
                <AuthGuard>
                  <DashboardLayout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patients" element={<Patients />} />
                        <Route path="/patients/create" element={<CreatePatient />} />
                        <Route path="/patients/edit/:id" element={<EditPatient />} />
                      </Routes>
                    </Suspense>
                  </DashboardLayout>
                </AuthGuard>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
