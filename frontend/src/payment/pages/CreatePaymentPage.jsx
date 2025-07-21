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
    paymentMethod: '',
    paymentDate: '',
    transactionId: '',
    status: '',
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
    if (!formData.paymentMethod) newErrors.paymentMethod = 'El método de pago es obligatorio';
    if (!formData.paymentDate) newErrors.paymentDate = 'La fecha de pago es obligatoria';
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
      // El API devuelve directamente el objeto creado si es exitoso
      if (response && response.id) {
        toast.success('Pago registrado exitosamente');
        navigate('/payments');
      } else {
        setErrors({ submit: response.message || 'Error al registrar el pago' });
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
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
                <h3 className="font-medium" style={{ color: colors.error?.[700] || '#b91c1c' }}>
                  Error al registrar pago
                </h3>
                <p className="text-sm" style={{ color: colors.error?.[600] || '#dc2626' }}>
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
              {/* Factura */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  🧾 Factura *
                </label>
                <select
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.invoiceId ? (colors.error?.[400] || '#fca5a5') : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona una factura</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      Factura #{inv.id} - S/ {parseFloat(inv.total || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
                {errors.invoiceId && (
                  <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                    {errors.invoiceId}
                  </p>
                )}
              </div>

              {/* Monto */}
              <Input
                label="💰 Monto"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                placeholder="0.00"
              />

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  💳 Método de Pago *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.paymentMethod ? (colors.error?.[400] || '#fca5a5') : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona un método</option>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                  <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                  <option value="transferencia">🏦 Transferencia Bancaria</option>
                  <option value="yape">📱 Yape</option>
                  <option value="plin">📱 Plin</option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Fecha de Pago */}
              <Input
                label="📅 Fecha de Pago"
                name="paymentDate"
                type="datetime-local"
                required
                value={formData.paymentDate}
                onChange={handleChange}
                error={errors.paymentDate}
              />

              {/* ID de Transacción */}
              <Input
                label="🏷️ ID de Transacción"
                name="transactionId"
                type="text"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="CASH-001, VISA-1234, etc."
              />

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  📊 Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    borderColor: errors.status ? (colors.error?.[400] || '#fca5a5') : colors.border.light,
                    color: colors.text.primary
                  }}
                >
                  <option value="">Selecciona un estado</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </select>
                {errors.status && (
                  <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                    {errors.status}
                  </p>
                )}
              </div>
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