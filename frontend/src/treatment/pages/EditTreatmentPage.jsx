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
    patientId: '',
    doctorId: '',
    treatmentType: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) fetchTreatment();
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

  const fetchTreatment = async () => {
    try {
      setLoadingTreatment(true);
      const response = await treatmentService.getById(id);
      if (response.success) {
        const data = response.data;
        setTreatment(data);
        setFormData({
          patientId: data.patientId || '',
          doctorId: data.doctorId || '',
          treatmentType: data.treatmentType || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          notes: data.notes || '',
        });
      } else {
        toast.error(response.message || 'Error al cargar el tratamiento');
        navigate('/treatments');
      }
    } catch (err) {
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
    if (!formData.patientId) newErrors.patientId = 'El paciente es obligatorio';
    if (!formData.doctorId) newErrors.doctorId = 'El médico es obligatorio';
    if (!formData.treatmentType.trim()) newErrors.treatmentType = 'El tipo de tratamiento es obligatorio';
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
      if (response.success) {
        toast.success('Tratamiento actualizado exitosamente');
        navigate('/treatments');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar el tratamiento' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
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
                label="Tipo de Tratamiento"
                name="treatmentType"
                type="text"
                required
                value={formData.treatmentType}
                onChange={handleChange}
                error={errors.treatmentType}
              />
              <Input
                label="Fecha de Inicio"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <Input
                label="Fecha de Fin"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
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