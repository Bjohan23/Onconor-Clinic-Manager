import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { treatmentService } from '../services/treatmentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { medicalRecordService } from '../../medicalrecord/services/medicalRecordService';

const CreateTreatmentPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    medicalRecordId: '',
    description: '',
    startDate: '',
    endDate: '',
    instructions: '',
  });
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      const mrRes = await medicalRecordService.getMedicalRecordsWithPagination(1, 100);
      // El API devuelve directamente un array
      const records = Array.isArray(mrRes) ? mrRes : [];
      setMedicalRecords(records);
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
    if (!formData.medicalRecordId) newErrors.medicalRecordId = 'El historial médico es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción del tratamiento es obligatoria';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await treatmentService.create(formData);
      // El API devuelve directamente el objeto creado si es exitoso
      if (response && response.id) {
        toast.success('Tratamiento creado exitosamente');
        navigate('/treatments');
      } else {
        setErrors({ submit: response.message || 'Error al crear el tratamiento' });
      }
    } catch (err) {
      console.error('Error creating treatment:', err);
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
            Nuevo Tratamiento
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Registra la información del tratamiento
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
                <h3 className="font-medium" style={{ color: colors.error?.[700] || '#b91c1c' }}>
                  Error al crear tratamiento
                </h3>
                <p className="text-sm" style={{ color: colors.error?.[600] || '#dc2626' }}>
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
              {/* Historial Médico */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  📋 Historial Médico *
                </label>
                <select
                  name="medicalRecordId"
                  value={formData.medicalRecordId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.medicalRecordId ? (colors.error?.[400] || '#fca5a5') : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona un historial médico</option>
                  {medicalRecords.map((record) => (
                    <option key={record.id} value={record.id}>
                      Historial #{record.id} - {record.patient?.fullName || `Paciente #${record.patientId}`}
                      {record.diagnosis && ` - ${record.diagnosis.substring(0, 50)}${record.diagnosis.length > 50 ? '...' : ''}`}
                    </option>
                  ))}
                </select>
                {errors.medicalRecordId && (
                  <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                    {errors.medicalRecordId}
                  </p>
                )}
              </div>

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

              {/* Descripción del Tratamiento */}
              <div className="md:col-span-2">
                <TextArea
                  label="📝 Descripción del Tratamiento"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Describe el tratamiento a realizar..."
                />
              </div>

              {/* Instrucciones */}
              <div className="md:col-span-2">
                <TextArea
                  label="📝 Instrucciones"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Instrucciones adicionales para el tratamiento..."
                />
              </div>
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
                {loading ? 'Creando...' : 'Crear Tratamiento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateTreatmentPage; 