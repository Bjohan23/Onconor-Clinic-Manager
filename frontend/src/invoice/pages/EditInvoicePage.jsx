import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { invoiceService } from '../services/invoiceService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

const EditInvoicePage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [errors, setErrors] = useState({});
  const [invoice, setInvoice] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    status: '',
    description: '',
  });

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoadingInvoice(true);
      const response = await invoiceService.getById(id);
      if (response.success) {
        const data = response.data;
        setInvoice(data);
        setFormData({
          patientId: data.patientId || '',
          amount: data.amount || '',
          status: data.status || '',
          description: data.description || '',
        });
      } else {
        toast.error(response.message || 'Error al cargar la factura');
        navigate('/invoices');
      }
    } catch (err) {
      toast.error('Error de conexión al cargar la factura');
      navigate('/invoices');
    } finally {
      setLoadingInvoice(false);
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
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!formData.status) newErrors.status = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await invoiceService.update(id, formData);
      if (response.success) {
        toast.success('Factura actualizada exitosamente');
        navigate('/invoices');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar la factura' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvoice) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando factura..." center />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Factura no encontrada
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          La factura solicitada no existe o no tienes permisos para editarla.
        </p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Volver a Facturas
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Factura
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información de la factura
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/invoices')}>
          Volver a Facturas
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al actualizar factura
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
            <CardTitle>Información de la Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="ID Paciente"
                name="patientId"
                type="text"
                required
                value={formData.patientId}
                onChange={handleChange}
                error={errors.patientId}
              />
              <Input
                label="Monto"
                name="amount"
                type="number"
                required
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
              />
              <Input
                label="Estado"
                name="status"
                type="text"
                required
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
              />
              <TextArea
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/invoices')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Factura'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditInvoicePage; 