import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { prescriptionService } from '../services/prescriptionService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';
import { treatmentService } from '../../treatment/services/treatmentService';

const CreatePrescriptionPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    treatmentId: '',
    patientId: '',
    doctorId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const pRes = await patientService.getActivePatients();
        const dRes = await doctorService.getActiveDoctors();
        const tRes = await treatmentService.getAll();
        
        console.log('Treatments response:', tRes); // Debug log
        
        setPatients(pRes.data?.patients || []);
        setDoctors(dRes.data?.doctors || []);
        // Try multiple possible response structures
        setTreatments(tRes.data?.treatments || tRes.data || tRes || []);
      } catch (error) {
        console.error('Error fetching options:', error);
        setTreatments([]);
      }
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
    if (!formData.treatmentId) newErrors.treatmentId = 'El tratamiento es obligatorio';
    if (!formData.medication.trim()) newErrors.medication = 'El medicamento es obligatorio';
    if (!formData.dosage.trim()) newErrors.dosage = 'La dosis es obligatoria';
    if (!formData.frequency.trim()) newErrors.frequency = 'La frecuencia es obligatoria';
    if (!formData.duration.trim()) newErrors.duration = 'La duración es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await prescriptionService.create(formData);
      // API returns the created prescription object directly
      if (response.data || response.id) {
        toast.success('Prescripción creada exitosamente');
        navigate('/prescriptions');
      } else {
        setErrors({ submit: 'Error al crear la prescripción' });
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      setErrors({ submit: err.response?.data?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Nueva Prescripción
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Registra la información de la prescripción
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
                  Error al crear prescripción
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
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Tratamiento *
                </label>
                <select
                  name="treatmentId"
                  value={formData.treatmentId}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  style={{ color: errors.treatmentId ? colors.error[600] : colors.text.primary }}
                >
                  <option value="">Selecciona un tratamiento</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.description || t.name || `Tratamiento ${t.id}`}
                    </option>
                  ))}
                </select>
                {errors.treatmentId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.treatmentId}
                  </p>
                )}
              </div>
              <Input
                label="Medicamento"
                name="medication"
                type="text"
                required
                value={formData.medication}
                onChange={handleChange}
                error={errors.medication}
              />
              <Input
                label="Dosis"
                name="dosage"
                type="text"
                required
                value={formData.dosage}
                onChange={handleChange}
                error={errors.dosage}
              />
              <Input
                label="Frecuencia"
                name="frequency"
                type="text"
                required
                placeholder="Ej: Cada 8 horas"
                value={formData.frequency}
                onChange={handleChange}
                error={errors.frequency}
              />
              <Input
                label="Duración"
                name="duration"
                type="text"
                required
                placeholder="Ej: 7 días"
                value={formData.duration}
                onChange={handleChange}
                error={errors.duration}
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Instrucciones"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Instrucciones adicionales para el paciente..."
                />
              </div>
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
                {loading ? 'Creando...' : 'Crear Prescripción'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreatePrescriptionPage; 