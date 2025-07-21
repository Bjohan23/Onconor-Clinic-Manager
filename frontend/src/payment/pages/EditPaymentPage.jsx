import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { paymentService } from '../services/paymentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { invoiceService } from '../../invoice/services/invoiceService';

const EditPaymentPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState(null);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: '',
    status: '',
    notes: '',
  });
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (id) fetchPayment();
  }, [id]);

  useEffect(() => {
    async function fetchOptions() {
      const iRes = await invoiceService.getAll();
      setInvoices(iRes.data?.invoices || []);
    }
    fetchOptions();
  }, []);

  const fetchPayment = async () => {
    try {
      setLoadingPayment(true);
      const response = await paymentService.getById(id);
      if (response.success) {
        const data = response.data?.payment;
        setPayment(data);
        setFormData({
          invoiceId: data.invoiceId || '',
          amount: data.amount || '',
          method: data.method || '',
          status: data.status || '',
          notes: data.notes || '',
        });
      } else {
        toast.error(response.message || 'Error al cargar el pago');
        navigate('/payments');
      }
    } catch (err) {
      toast.error('Error de conexión al cargar el pago');
      navigate('/payments');
    } finally {
      setLoadingPayment(false);
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
    if (!formData.invoiceId) newErrors.invoiceId = 'La factura es obligatoria';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!formData.method) newErrors.method = 'El método de pago es obligatorio';
    if (!formData.status) newErrors.status = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await paymentService.update(id, formData);
      if (response.success) {
        toast.success('Pago actualizado exitosamente');
        navigate('/payments');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar el pago' });
      }
    } catch (err) {
      setErrors({ submit: 'Error de conexión. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPayment) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando pago..." center />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Pago no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          El pago solicitado no existe o no tienes permisos para editarlo.
        </p>
        <Button onClick={() => navigate('/payments')} className="mt-4">
          Volver a Pagos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Editar Pago
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Modifica la información del pago
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/payments')}>
          Volver a Pagos
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card variant="critical">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium" style={{ color: colors.error[700] }}>
                  Error al actualizar pago
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
            <CardTitle>Información del Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                required
                className="input-modern"
              >
                <option value="">Selecciona una factura</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.description || `Factura #${inv.id}`}</option>
                ))}
              </select>
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
                label="Método de Pago"
                name="method"
                type="text"
                required
                value={formData.method}
                onChange={handleChange}
                error={errors.method}
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
              <Button type="button" variant="ghost" onClick={() => navigate('/payments')} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Pago'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditPaymentPage; 