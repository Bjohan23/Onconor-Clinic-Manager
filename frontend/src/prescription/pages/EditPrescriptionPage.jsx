import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { prescriptionService } from '../services/prescriptionService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

const EditPrescriptionPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(true);
  const [errors, setErrors] = useState({});
  const [prescription, setPrescription] = useState(null);
  const [formData, setFormData] = useState({
    treatmentId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) fetchPrescription();
  }, [id]);

  useEffect(() => {
    async function fetchOptions() {
      const pRes = await patientService.getActivePatients();
      const dRes = await doctorService.getActiveDoctors();
      setPatients(pRes.data?.patients || []);
      setDoctors(dRes.data?.doctors || []);
    }
    fetchOptions();
  }, []);

  const fetchPrescription = async () => {
    try {
      setLoadingPrescription(true);
      const response = await prescriptionService.getById(id);
      // El API devuelve directamente el objeto de prescripción
      if (response && response.id) {
        setPrescription(response);
        setFormData({
          treatmentId: response.treatmentId || '',
          medication: response.medication || '',
          dosage: response.dosage || '',
          frequency: response.frequency || '',
          duration: response.duration || '',
          instructions: response.instructions || '',
        });
      } else {
        toast.error('Error al cargar la prescripción');
        navigate('/prescriptions');
      }
    } catch (err) {
      console.error('Error fetching prescription:', err);
      toast.error('Error de conexión al cargar la prescripción');
      navigate('/prescriptions');
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.treatmentId) newErrors.treatmentId = 'El tratamiento es obligatorio';
    if (!formData.medication.trim()) newErrors.medication = 'El medicamento es obligatorio';
    if (!formData.dosage.trim()) newErrors.dosage = 'La dosis es obligatoria';
    if (!formData.frequency.trim()) newErrors.frequency = 'La frecuencia es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await prescriptionService.update(id, formData);
      // El API devuelve directamente el objeto actualizado si es exitoso
      if (response && response.id) {
        toast.success('Prescripción actualizada exitosamente');
        navigate('/prescriptions');
      } else {
        setErrors({ submit: response?.message || 'Error al actualizar la prescripción' });
      }
    } catch (err) {
      console.error('Error updating prescription:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPrescription) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando prescripción..." center />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Prescripción no encontrada
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          La prescripción solicitada no existe o no tienes permisos para editarla.
        </p>
        <Button onClick={() => navigate('/prescriptions')} className="mt-4">
          Volver a Prescripciones
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Prescripción
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información de la prescripción
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/prescriptions')}>
          Volver a Prescripciones
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al actualizar prescripción
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
            <CardTitle>Información de la Prescripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del paciente (solo lectura) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  👤 Paciente
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    {prescription?.patient?.fullName || `Tratamiento #${formData.treatmentId}`}
                  </div>
                  {prescription?.patient?.dni && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      DNI: {prescription.patient.dni}
                    </div>
                  )}
                </div>
              </div>

              {/* Información del doctor (solo lectura) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  👨‍⚕️ Médico
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    {prescription?.doctor?.fullName || 'No asignado'}
                  </div>
                  {prescription?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {prescription.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Información del tratamiento (solo lectura) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  🏥 Tratamiento
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    Tratamiento #{formData.treatmentId}
                  </div>
                  {prescription?.treatment?.description && (
                    <div className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                      {prescription.treatment.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Medicamento (editable) */}
              <Input
                label="💊 Medicamento"
                name="medication"
                type="text"
                required
                value={formData.medication}
                onChange={handleChange}
                error={errors.medication}
                placeholder="Nombre del medicamento..."
              />

              {/* Dosis (editable) */}
              <Input
                label="📏 Dosis"
                name="dosage"
                type="text"
                required
                value={formData.dosage}
                onChange={handleChange}
                error={errors.dosage}
                placeholder="ej: 10mg, 5ml..."
              />

              {/* Frecuencia (editable) */}
              <Input
                label="⏰ Frecuencia"
                name="frequency"
                type="text"
                required
                value={formData.frequency}
                onChange={handleChange}
                error={errors.frequency}
                placeholder="ej: Una vez al día, cada 8 horas..."
              />

              {/* Duración (editable) */}
              <Input
                label="📅 Duración"
                name="duration"
                type="text"
                value={formData.duration}
                onChange={handleChange}
                placeholder="ej: 7 días, 3 semanas..."
              />
            </div>

            {/* Instrucciones (campo completo) */}
            <div className="mt-6">
              <TextArea
                label="📝 Instrucciones"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Instrucciones detalladas de cómo tomar el medicamento..."
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/prescriptions')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Prescripción'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditPrescriptionPage; 