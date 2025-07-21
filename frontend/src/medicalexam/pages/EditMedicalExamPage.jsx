import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { medicalExamService } from '../services/medicalExamService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

const EditMedicalExamPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingExam, setLoadingExam] = useState(true);
  const [errors, setErrors] = useState({});
  const [exam, setExam] = useState(null);
  const [formData, setFormData] = useState({
    medicalRecordId: '',
    examType: '',
    results: '',
    examDate: '',
    notes: '',
  });
  useEffect(() => {
    if (id) fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoadingExam(true);
      const response = await medicalExamService.getById(id);
      // El API devuelve { success: true, data: { exam: {...} } }
      if (response.success && response.data?.exam) {
        const examData = response.data.exam;
        setExam(examData);
        setFormData({
          medicalRecordId: examData.medicalRecordId || '',
          examType: examData.examType || '',
          results: examData.results || '',
          examDate: examData.examDate ? examData.examDate.slice(0, 16) : '', // Formato para datetime-local
          notes: examData.notes || '',
        });
      } else {
        toast.error('Error al cargar el examen médico');
        navigate('/medical-exams');
      }
    } catch (err) {
      console.error('Error fetching medical exam:', err);
      toast.error('Error de conexión al cargar el examen médico');
      navigate('/medical-exams');
    } finally {
      setLoadingExam(false);
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
    if (!formData.examType.trim()) newErrors.examType = 'El tipo de examen es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await medicalExamService.update(id, formData);
      // El API devuelve { success: true, data: { exam: {...} } }
      if (response.success && response.data?.exam) {
        toast.success('Examen médico actualizado exitosamente');
        navigate('/medical-exams');
      } else {
        setErrors({ submit: response?.message || 'Error al actualizar el examen médico' });
      }
    } catch (err) {
      console.error('Error updating medical exam:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingExam) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando examen..." center />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Examen no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          El examen solicitado no existe o no tienes permisos para editarlo.
        </p>
        <Button onClick={() => navigate('/medical-exams')} className="mt-4">
          Volver a Exámenes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Examen Médico
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información del examen médico
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/medical-exams')}>
          Volver a Exámenes
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al actualizar examen médico
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
            <CardTitle>Información del Examen</CardTitle>
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
                    {exam?.patient?.fullName || `Historial #${formData.medicalRecordId}`}
                  </div>
                  {exam?.patient?.dni && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      DNI: {exam.patient.dni}
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
                    {exam?.doctor?.fullName || 'No asignado'}
                  </div>
                  {exam?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {exam.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Historial Médico (solo lectura) */}
              <div className="md:col-span-2">
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
                  {exam?.medicalRecord?.diagnosis && (
                    <div className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                      Diagnóstico: {exam.medicalRecord.diagnosis}
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de Examen (editable) */}
              <Input
                label="🔬 Tipo de Examen"
                name="examType"
                type="text"
                required
                value={formData.examType}
                onChange={handleChange}
                error={errors.examType}
                placeholder="Nombre del tipo de examen..."
              />

              {/* Fecha del Examen (editable) */}
              <Input
                label="📅 Fecha del Examen"
                name="examDate"
                type="datetime-local"
                value={formData.examDate}
                onChange={handleChange}
              />
            </div>

            {/* Resultados (campo completo) */}
            <div className="mt-6">
              <TextArea
                label="📋 Resultados"
                name="results"
                value={formData.results}
                onChange={handleChange}
                placeholder="Resultados del examen médico..."
              />
            </div>

            {/* Notas (campo completo) */}
            <div className="mt-6">
              <TextArea
                label="📝 Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el examen..."
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/medical-exams')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Examen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditMedicalExamPage; 