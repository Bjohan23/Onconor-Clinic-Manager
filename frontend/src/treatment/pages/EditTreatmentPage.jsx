import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { treatmentService } from '../services/treatmentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

const EditTreatmentPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingTreatment, setLoadingTreatment] = useState(true);
  const [errors, setErrors] = useState({});
  const [treatment, setTreatment] = useState(null);
  const [formData, setFormData] = useState({
    medicalRecordId: '',
    description: '',
    medications: '',
    instructions: '',
    startDate: '',
    endDate: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) fetchTreatment();
  }, [id]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const pRes = await patientService.getActivePatients();
        const dRes = await doctorService.getActiveDoctors();
        // El API de pacientes activos devuelve una estructura diferente
        setPatients(pRes?.data?.patients || []);
        setDoctors(Array.isArray(dRes) ? dRes : (dRes?.doctors || []));
      } catch (error) {
        console.error('Error loading options:', error);
      }
    }
    fetchOptions();
  }, []);

  const fetchTreatment = async () => {
    try {
      setLoadingTreatment(true);
      const response = await treatmentService.getById(id);
      // El API devuelve directamente el objeto del tratamiento
      if (response && response.id) {
        setTreatment(response);
        setFormData({
          medicalRecordId: response.medicalRecordId || '',
          description: response.description || '',
          medications: response.medications || '',
          instructions: response.instructions || '',
          startDate: response.startDate ? response.startDate.split('T')[0] : '', // Formato YYYY-MM-DD
          endDate: response.endDate ? response.endDate.split('T')[0] : '',
        });
      } else {
        toast.error('Error al cargar el tratamiento');
        navigate('/treatments');
      }
    } catch (err) {
      console.error('Error fetching treatment:', err);
      toast.error('Error de conexión al cargar el tratamiento');
      navigate('/treatments');
    } finally {
      setLoadingTreatment(false);
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
    if (!formData.medicalRecordId) newErrors.medicalRecordId = 'El historial médico es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.medications.trim()) newErrors.medications = 'Los medicamentos son obligatorios';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await treatmentService.update(id, formData);
      // El API devuelve directamente el objeto actualizado si es exitoso
      if (response && response.id) {
        toast.success('Tratamiento actualizado exitosamente');
        navigate('/treatments');
      } else {
        setErrors({ submit: response?.message || 'Error al actualizar el tratamiento' });
      }
    } catch (err) {
      console.error('Error updating treatment:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingTreatment) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando tratamiento..." center />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Tratamiento no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          El tratamiento solicitado no existe o no tienes permisos para editarlo.
        </p>
        <Button onClick={() => navigate('/treatments')} className="mt-4">
          Volver a Tratamientos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Tratamiento
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información del tratamiento
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/treatments')}>
          Volver a Tratamientos
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al actualizar tratamiento
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
            <CardTitle>Información del Tratamiento</CardTitle>
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
                    {treatment?.patient?.fullName || `Historial #${formData.medicalRecordId}`}
                  </div>
                  {treatment?.patient?.dni && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      DNI: {treatment.patient.dni}
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
                    {treatment?.doctor?.fullName || 'No asignado'}
                  </div>
                  {treatment?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {treatment.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Historial médico ID (solo lectura) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  📋 Historial Médico
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    Historial #{formData.medicalRecordId}
                  </div>
                  {treatment?.medicalRecord?.diagnosis && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {treatment.medicalRecord.diagnosis}
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción (editable) */}
              <Input
                label="🏥 Descripción"
                name="description"
                type="text"
                required
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                placeholder="Describe el tratamiento..."
              />

              {/* Medicamentos (editable) */}
              <Input
                label="💊 Medicamentos"
                name="medications"
                type="text"
                required
                value={formData.medications}
                onChange={handleChange}
                error={errors.medications}
                placeholder="Especifica los medicamentos..."
              />

              {/* Fecha de Inicio */}
              <Input
                label="📅 Fecha de Inicio"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />

              {/* Fecha de Fin */}
              <Input
                label="📅 Fecha de Fin"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            {/* Instrucciones (campo completo) */}
            <div className="mt-6">
              <TextArea
                label="📝 Instrucciones"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Instrucciones detalladas del tratamiento..."
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/treatments')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Tratamiento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditTreatmentPage; 