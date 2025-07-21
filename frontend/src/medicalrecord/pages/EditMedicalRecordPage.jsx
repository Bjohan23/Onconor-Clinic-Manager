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
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) fetchRecord();
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

  const fetchRecord = async () => {
    try {
      setLoadingRecord(true);
      const response = await medicalRecordService.getById(id);
      if (response.success) {
        const data = response.data;
        setRecord(data);
        setFormData({
          patientId: data.patientId || '',
          doctorId: data.doctorId || '',
          diagnosis: data.diagnosis || '',
          notes: data.notes || '',
        });
      } else {
        toast.error(response.message || 'Error al cargar el historial');
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
      const response = await medicalRecordService.update(id, formData);
      if (response.success) {
        toast.success('Historial médico actualizado exitosamente');
        navigate('/medical-records');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar el historial médico' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
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
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="input-modern"
              >
                <option value="">Selecciona un paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName || `${p.firstName} ${p.lastName}`}</option>
                ))}
              </select>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="input-modern"
              >
                <option value="">Selecciona un médico</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName || `${d.firstName} ${d.lastName}`}</option>
                ))}
              </select>
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
                label="Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
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