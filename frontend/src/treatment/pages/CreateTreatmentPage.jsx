import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { treatmentService } from '../services/treatmentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

const CreateTreatmentPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    async function fetchOptions() {
      const pRes = await patientService.getActivePatients();
      const dRes = await doctorService.getActiveDoctors();
      setPatients(pRes.data?.patients || []);
      setDoctors(dRes.data?.doctors || []);
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
      const response = await treatmentService.create(formData);
      if (response.success) {
        toast.success('Tratamiento creado exitosamente');
        navigate('/treatments');
      } else {
        setErrors({ submit: response.message || 'Error al crear el tratamiento' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
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
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al crear tratamiento
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