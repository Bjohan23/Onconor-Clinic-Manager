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
    patientId: '',
    doctorId: '',
    medication: '',
    dosage: '',
    notes: '',
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
      if (response.success) {
        const data = response.data?.prescription;
        setPrescription(data);
        setFormData({
          patientId: data.patientId || '',
          doctorId: data.doctorId || '',
          medication: data.medication || '',
          dosage: data.dosage || '',
          notes: data.notes || '',
        });
      } else {
        toast.error(response.message || 'Error al cargar la prescripción');
        navigate('/prescriptions');
      }
    } catch (err) {
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
    if (!formData.patientId) newErrors.patientId = 'El paciente es obligatorio';
    if (!formData.doctorId) newErrors.doctorId = 'El médico es obligatorio';
    if (!formData.medication.trim()) newErrors.medication = 'El medicamento es obligatorio';
    if (!formData.dosage.trim()) newErrors.dosage = 'La dosis es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await prescriptionService.update(id, formData);
      if (response.success) {
        toast.success('Prescripción actualizada exitosamente');
        navigate('/prescriptions');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar la prescripción' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
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