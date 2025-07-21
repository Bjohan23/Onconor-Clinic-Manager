import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { medicalRecordService } from '../services/medicalRecordService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';
import appointmentService from '../../services/appointmentService';

const CreateMedicalRecordPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentId: '', // Campo requerido por el modelo
    diagnosis: '',
    symptoms: '',
    observations: '',
    date: '', // Campo requerido por el modelo
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      const pRes = await patientService.getActivePatients();
      const dRes = await doctorService.getActiveDoctors();
      const aRes = await appointmentService.getAppointments({}, 1, 100); // Obtener citas
      setPatients(pRes.data?.patients || []);
      setDoctors(dRes.data?.doctors || []);
      setAppointments(aRes.data?.appointments || []);
    }
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'El paciente es obligatorio';
    if (!formData.doctorId) newErrors.doctorId = 'El médico es obligatorio';
    if (!formData.appointmentId) newErrors.appointmentId = 'La cita es obligatoria';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'El diagnóstico es obligatorio';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await medicalRecordService.create(formData);
      // El API devuelve directamente el objeto creado si es exitoso
      if (response && response.id) {
        toast.success('Historial médico creado exitosamente');
        navigate('/medical-records');
      } else {
        setErrors({ submit: response?.message || 'Error al crear el historial médico' });
      }
    } catch (err) {
      console.error('Error creating medical record:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Nuevo Historial Médico
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Registra la información del historial médico
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/medical-records')}>
          Volver a Historiales
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al crear historial médico
                </h3>
                <p className="text-sm" style={{ color: colors.error[600] }}>
                  {errors.submit}
                </p>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Información del Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paciente */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  👤 Paciente *
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="input-modern w-full p-2 border rounded-lg" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.patientId ? colors.error[400] : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName || `${p.firstName} ${p.lastName}`}</option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.patientId}
                  </p>
                )}
              </div>

              {/* Médico */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  👨‍⚕️ Médico *
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  className="input-modern w-full p-2 border rounded-lg"
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.doctorId ? colors.error[400] : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona un médico</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.fullName || `${d.firstName} ${d.lastName}`}</option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.doctorId}
                  </p>
                )}
              </div>

              {/* Cita Médica */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  📅 Cita Médica *
                </label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleChange}
                  required
                  className="input-modern w-full p-2 border rounded-lg"
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.appointmentId ? colors.error[400] : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona una cita</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`Cita #${a.id} - ${new Date(a.appointmentDate).toLocaleDateString('es-ES')} ${new Date(a.appointmentDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                    </option>
                  ))}
                </select>
                {errors.appointmentId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.appointmentId}
                  </p>
                )}
              </div>

              {/* Fecha del Historial */}
              <Input
                label="📅 Fecha del Historial"
                name="date"
                type="datetime-local"
                required
                value={formData.date}
                onChange={handleChange}
                error={errors.date}
              />

              {/* Diagnóstico */}
              <div className="md:col-span-2">
                <Input
                  label="📝 Diagnóstico"
                  name="diagnosis"
                  type="text"
                  required
                  value={formData.diagnosis}
                  onChange={handleChange}
                  error={errors.diagnosis}
                  placeholder="Ingrese el diagnóstico..."
                />
              </div>

              {/* Síntomas */}
              <div className="md:col-span-2">
                <TextArea
                  label="🩺 Síntomas"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Descripción de los síntomas presentados..."
                />
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <TextArea
                  label="🔍 Observaciones"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Observaciones adicionales del médico..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/medical-records')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Creando...' : 'Crear Historial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateMedicalRecordPage; 