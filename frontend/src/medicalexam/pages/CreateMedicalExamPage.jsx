import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { medicalExamService } from '../services/medicalExamService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { patientService } from '../../patients/services/patientService';
import { doctorService } from '../../doctors/services/doctorService';

const CreateMedicalExamPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    examType: '',
    result: '',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    async function fetchOptions() {
      setLoadingOptions(true);
      setOptionsError('');
      try {
        const [pRes, dRes] = await Promise.all([
          patientService.getActivePatients(),
          doctorService.getActiveDoctors()
        ]);
        
        setPatients(pRes.data?.patients || []);
        setDoctors(dRes.data?.doctors || []);
        
        if ((!pRes.data?.patients || pRes.data.patients.length === 0) && 
            (!dRes.data?.doctors || dRes.data.doctors.length === 0)) {
          setOptionsError('No hay pacientes ni médicos disponibles. Contacta al administrador.');
        } else if (!pRes.data?.patients || pRes.data.patients.length === 0) {
          setOptionsError('No hay pacientes disponibles. Debes crear al menos un paciente primero.');
        } else if (!dRes.data?.doctors || dRes.data.doctors.length === 0) {
          setOptionsError('No hay médicos disponibles. Debes crear al menos un médico primero.');
        }
      } catch (error) {
        console.error('Error fetching options:', error);
        setOptionsError('Error al cargar pacientes y médicos. Verifica tu conexión.');
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores específicos del campo que está siendo modificado
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Limpiar error general de envío si existe
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Debes seleccionar un paciente';
    if (!formData.doctorId) newErrors.doctorId = 'Debes seleccionar un médico';
    if (!formData.examType.trim()) newErrors.examType = 'El tipo de examen es obligatorio';
    if (formData.examType.trim().length < 3) newErrors.examType = 'El tipo de examen debe tener al menos 3 caracteres';
    if (!formData.result.trim()) newErrors.result = 'El resultado es obligatorio';
    if (formData.result.trim().length < 5) newErrors.result = 'El resultado debe tener al menos 5 caracteres';
    if (formData.notes.length > 500) newErrors.notes = 'Las notas no pueden exceder 500 caracteres';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Enfocar el primer campo con error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const field = document.querySelector(`[name="${firstErrorField}"]`);
        if (field) field.focus();
      }
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await medicalExamService.create(formData);
      if (response.success) {
        toast.success('Examen médico creado exitosamente');
        navigate('/medical-exams');
      } else {
        setErrors({ submit: response.message || 'Error al crear el examen médico. Intenta nuevamente.' });
      }
    } catch (err) {
      console.error('Error creating medical exam:', err);
      const errorMessage = err.response?.data?.message || 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Mostrar confirmación si hay datos ingresados
    const hasData = Object.values(formData).some(value => value.trim() !== '');
    if (hasData) {
      const confirmed = window.confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.');
      if (!confirmed) return;
    }
    navigate('/medical-exams');
  };

  // Si está cargando las opciones, mostrar indicador
  if (loadingOptions) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-lg" style={{ color: colors.text.secondary }}>
            Cargando pacientes y médicos...
          </p>
        </div>
      </div>
    );
  }

  // Si hay error al cargar opciones, mostrar mensaje
  if (optionsError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card variant="critical">
          <CardContent>
            <div className="text-center py-6">
              <h3 className="font-medium mb-2" style={{ color: colors.error[700] }}>
                No se pueden cargar los datos necesarios
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.error[600] }}>
                {optionsError}
              </p>
              <div className="space-x-3">
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
                <Button variant="ghost" onClick={() => navigate('/medical-exams')}>
                  Volver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Nuevo Examen Médico
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Completa todos los campos obligatorios para registrar el examen
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/medical-exams')}>
          Volver a Exámenes
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <CardContent>
              <div className="flex items-center">
                <div>
                  <h3 className="font-medium" style={{ color: colors.error[700] }}>
                    Error al crear examen médico
                  </h3>
                  <p className="text-sm" style={{ color: colors.error[600] }}>
                    {errors.submit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Información del Examen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Paciente *
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="input-modern"
                  style={{ borderColor: errors.patientId ? colors.error[300] : undefined }}
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName || `${p.firstName} ${p.lastName}`}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.patientId}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Médico *
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="input-modern"
                  style={{ borderColor: errors.doctorId ? colors.error[300] : undefined }}
                >
                  <option value="">Selecciona un médico</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName || `${d.firstName} ${d.lastName}`}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="text-sm mt-1" style={{ color: colors.error[600] }}>
                    {errors.doctorId}
                  </p>
                )}
              </div>
              
              <Input
                label="Tipo de Examen *"
                name="examType"
                type="text"
                required
                value={formData.examType}
                onChange={handleChange}
                error={errors.examType}
                disabled={loading}
                placeholder="Ej: Análisis de sangre, Radiografía"
                maxLength={100}
              />
              
              <Input
                label="Resultado *"
                name="result"
                type="text"
                required
                value={formData.result}
                onChange={handleChange}
                error={errors.result}
                disabled={loading}
                placeholder="Describe el resultado del examen"
                maxLength={200}
              />
              
              <div className="md:col-span-2">
                <TextArea
                  label="Notas adicionales"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  error={errors.notes}
                  disabled={loading}
                  placeholder="Observaciones, recomendaciones o notas adicionales (opcional)"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                  {formData.notes.length}/500 caracteres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleCancel} 
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                loading={loading} 
                disabled={loading || patients.length === 0 || doctors.length === 0}
              >
                {loading ? 'Creando...' : 'Crear Examen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateMedicalExamPage;