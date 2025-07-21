import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { medicalRecordService } from '../services/medicalRecordService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

const EditMedicalRecordPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [errors, setErrors] = useState({});
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    notes: '',
    symptoms: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const pRes = await patientService.getActivePatients();
        const dRes = await doctorService.getActiveDoctors();
        // Ajustar según la estructura real de las respuestas del API
        setPatients(Array.isArray(pRes) ? pRes : (pRes?.patients || []));
        setDoctors(Array.isArray(dRes) ? dRes : (dRes?.doctors || []));
      } catch (error) {
        console.error('Error loading options:', error);
        // Intentar con los servicios básicos si fallan los específicos
        try {
          const pRes = await patientService.getAll();
          const dRes = await doctorService.getAll();
          setPatients(Array.isArray(pRes) ? pRes : []);
          setDoctors(Array.isArray(dRes) ? dRes : []);
        } catch (fallbackError) {
          console.error('Error loading fallback options:', fallbackError);
        }
      }
    }
    fetchOptions();
  }, []);

  const fetchRecord = async () => {
    try {
      setLoadingRecord(true);
      const response = await medicalRecordService.getById(id);
      // El API devuelve directamente el objeto del historial médico
      if (response && response.id) {
        setRecord(response);
        setFormData({
          patientId: response.patientId || '',
          doctorId: response.doctorId || '',
          diagnosis: response.diagnosis || '',
          notes: response.observations || '', // El API usa 'observations' en lugar de 'notes'
          symptoms: response.symptoms || ''
        });
      } else {
        toast.error('Error al cargar el historial');
        navigate('/medical-records');
      }
    } catch (err) {
      toast.error('Error de conexión al cargar el historial');
      navigate('/medical-records');
    } finally {
      setLoadingRecord(false);
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
    if (!formData.patientId) newErrors.patientId = 'El paciente es obligatorio';
    if (!formData.doctorId) newErrors.doctorId = 'El médico es obligatorio';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'El diagnóstico es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Mapear los datos del formulario al formato que espera el API
      const requestData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        observations: formData.notes, // El API espera 'observations', no 'notes'
      };
      
      const response = await medicalRecordService.update(id, requestData);
      // El API devuelve directamente el objeto actualizado si es exitoso
      if (response && response.id) {
        toast.success('Historial médico actualizado exitosamente');
        navigate('/medical-records');
      } else {
        setErrors({ submit: response?.message || 'Error al actualizar el historial médico' });
      }
    } catch (err) {
      console.error('Error updating medical record:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecord) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando historial..." center />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Historial no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          El historial solicitado no existe o no tienes permisos para editarlo.
        </p>
        <Button onClick={() => navigate('/medical-records')} className="mt-4">
          Volver a Historiales
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Historial Médico
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información del historial médico
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
                  Error al actualizar historial médico
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
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Paciente Actual
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    {record?.patient?.fullName || `Paciente ${formData.patientId}`}
                  </div>
                  {record?.patient?.email && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {record.patient.email}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Médico Actual
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    {record?.doctor?.fullName || `Doctor ${formData.doctorId}`}
                  </div>
                  {record?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {record.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>
              <Input
                label="Diagnóstico"
                name="diagnosis"
                type="text"
                required
                value={formData.diagnosis}
                onChange={handleChange}
                error={errors.diagnosis}
              />
              <TextArea
                label="Síntomas"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Describe los síntomas del paciente..."
              />
            </div>
            <div className="mt-6">
              <TextArea
                label="Observaciones"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observaciones médicas adicionales..."
              />
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
                {loading ? 'Actualizando...' : 'Actualizar Historial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditMedicalRecordPage; 