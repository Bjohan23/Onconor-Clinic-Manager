import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './shared/contexts/ThemeContext'
import { AuthProvider } from './shared/contexts/AuthContext'
import { ToastProvider } from './shared/components/ui/Toast'
import { AuthGuard } from './shared/guards/AuthGuard'
import { GuestGuard } from './shared/guards/AuthGuard'
import { LoginPage } from './auth/pages/LoginPage'
import { DashboardLayout } from './shared/components/DashboardLayout'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './shared/components/LoadingSpinner'

const Dashboard = lazy(() => import('./dashboard/pages/DashboardPage'))
const Patients = lazy(() => import('./patients/pages/PatientsPage'))
const CreatePatient = lazy(() => import('./patients/pages/CreatePatientPage'))
const EditPatient = lazy(() => import('./patients/pages/EditPatientPage'))
const Doctors = lazy(() => import('./doctors/pages/DoctorsPage'))
const CreateDoctor = lazy(() => import('./doctors/pages/CreateDoctorPage'))
const EditDoctor = lazy(() => import('./doctors/pages/EditDoctorPage'))

const MedicalRecords = lazy(() => import('./medicalrecord/pages/MedicalRecordsPage'))
const CreateMedicalRecord = lazy(() => import('./medicalrecord/pages/CreateMedicalRecordPage'))
const EditMedicalRecord = lazy(() => import('./medicalrecord/pages/EditMedicalRecordPage'))
const Treatments = lazy(() => import('./treatment/pages/TreatmentsPage'))
const CreateTreatment = lazy(() => import('./treatment/pages/CreateTreatmentPage'))
const EditTreatment = lazy(() => import('./treatment/pages/EditTreatmentPage'))
const Prescriptions = lazy(() => import('./prescription/pages/PrescriptionsPage'))
const CreatePrescription = lazy(() => import('./prescription/pages/CreatePrescriptionPage'))
const EditPrescription = lazy(() => import('./prescription/pages/EditPrescriptionPage'))
const MedicalExams = lazy(() => import('./medicalexam/pages/MedicalExamsPage'))
const CreateMedicalExam = lazy(() => import('./medicalexam/pages/CreateMedicalExamPage'))
const EditMedicalExam = lazy(() => import('./medicalexam/pages/EditMedicalExamPage'))
const Invoices = lazy(() => import('./invoice/pages/InvoicesPage'))
const CreateInvoice = lazy(() => import('./invoice/pages/CreateInvoicePage'))
const EditInvoice = lazy(() => import('./invoice/pages/EditInvoicePage'))
const Payments = lazy(() => import('./payment/pages/PaymentsPage'))
const CreatePayment = lazy(() => import('./payment/pages/CreatePaymentPage'))
const EditPayment = lazy(() => import('./payment/pages/EditPaymentPage'))

// Appointments - Agregando importación de citas MODERNAS
const Appointments = lazy(() => import('./pages/ModernAppointments'))

// Specialties - Agregando importación de especialidades
const Specialties = lazy(() => import('./specialties/pages/SpecialtiesPage'))

// Reports - Agregando importación de reportes
const Reports = lazy(() => import('./reports/pages/ReportsPage'))

// Schedules - Agregando importación de horarios
const Schedules = lazy(() => import('./schedules/pages/SchedulesPage'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
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
                          <Route path="/doctors" element={<Doctors />} />
                          <Route path="/doctors/create" element={<CreateDoctor />} />
                          <Route path="/doctors/edit/:id" element={<EditDoctor />} />
                          <Route path="/medical-records" element={<MedicalRecords />} />
                          <Route path="/medical-records/create" element={<CreateMedicalRecord />} />
                          <Route path="/medical-records/edit/:id" element={<EditMedicalRecord />} />
                          <Route path="/treatments" element={<Treatments />} />
                          <Route path="/treatments/create" element={<CreateTreatment />} />
                          <Route path="/treatments/edit/:id" element={<EditTreatment />} />
                          <Route path="/prescriptions" element={<Prescriptions />} />
                          <Route path="/prescriptions/create" element={<CreatePrescription />} />
                          <Route path="/prescriptions/edit/:id" element={<EditPrescription />} />
                          <Route path="/medical-exams" element={<MedicalExams />} />
                          <Route path="/medical-exams/create" element={<CreateMedicalExam />} />
                          <Route path="/medical-exams/edit/:id" element={<EditMedicalExam />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/create" element={<CreateInvoice />} />
                          <Route path="/invoices/edit/:id" element={<EditInvoice />} />
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/payments/create" element={<CreatePayment />} />
                          <Route path="/payments/edit/:id" element={<EditPayment />} />
                          
                          {/* Rutas de Citas - HABILITADO */}
                          <Route path="/appointments" element={<Appointments />} />
                          
                          {/* Rutas de Especialidades - HABILITADO */}
                          <Route path="/specialties" element={<Specialties />} />
                          
                          {/* Rutas de Reportes - HABILITADO */}
                          <Route path="/reports" element={<Reports />} />
                          
                          {/* Rutas de Horarios - HABILITADO */}
                          <Route path="/schedules" element={<Schedules />} />
                        </Routes>
                      </Suspense>
                    </DashboardLayout>
                  </AuthGuard>
                } 
              />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
