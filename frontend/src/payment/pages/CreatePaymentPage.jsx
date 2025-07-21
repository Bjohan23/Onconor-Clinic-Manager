import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { paymentService } from '../services/paymentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { invoiceService } from '../../invoice/services/invoiceService';

const CreatePaymentPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: '',
    status: '',
    notes: '',
  });
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      const iRes = await invoiceService.getAll();
      setInvoices(iRes.data?.invoices || []);
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
      const response = await paymentService.create(formData);
      if (response.success) {
        toast.success('Pago registrado exitosamente');
        navigate('/payments');
      } else {
        setErrors({ submit: response.message || 'Error al registrar el pago' });
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
            Nuevo Pago
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Registra la información del pago
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
                  Error al registrar pago
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
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreatePaymentPage; 