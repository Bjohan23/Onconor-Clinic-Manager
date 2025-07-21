import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useToast } from '../../shared/components/ui/Toast';
import { paymentService } from '../services/paymentService';
import { Button } from '../../shared/components/ui/Button';
import { Input, TextArea } from '../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

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
    amount: '',
    paymentMethod: '',
    paymentDate: '',
    transactionId: '',
    status: '',
  });
  useEffect(() => {
    if (id) fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoadingPayment(true);
      const response = await paymentService.getById(id);
      // El API devuelve directamente el objeto de payment
      if (response && response.id) {
        setPayment(response);
        setFormData({
          amount: response.amount || '',
          paymentMethod: response.paymentMethod || '',
          paymentDate: response.paymentDate ? response.paymentDate.slice(0, 16) : '', // Formato datetime-local
          transactionId: response.transactionId || '',
          status: response.status || '',
        });
      } else {
        toast.error('Error al cargar el pago');
        navigate('/payments');
      }
    } catch (err) {
      console.error('Error fetching payment:', err);
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
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'El método de pago es obligatorio';
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
      // El API devuelve directamente el objeto actualizado si es exitoso
      if (response && response.id) {
        toast.success('Pago actualizado exitosamente');
        navigate('/payments');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar el pago' });
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
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
                <h3 className="font-medium" style={{ color: colors.error?.[700] || '#b91c1c' }}>
                  Error al actualizar pago
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
                    {payment?.invoice?.patient?.fullName || `Factura #${payment?.invoiceId}`}
                  </div>
                  {payment?.invoice?.patient?.dni && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      DNI: {payment.invoice.patient.dni}
                    </div>
                  )}
                  {payment?.invoice?.patient?.phone && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Teléfono: {payment.invoice.patient.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la factura (solo lectura) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  🧾 Factura
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    Factura #{payment?.invoiceId}
                  </div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>
                    Total: S/ {parseFloat(payment?.invoice?.total || 0).toFixed(2)}
                  </div>
                  {payment?.invoice?.appointment?.doctor?.fullName && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Dr. {payment.invoice.appointment.doctor.fullName}
                    </div>
                  )}
                  {payment?.invoice?.appointment?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {payment.invoice.appointment.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Monto (editable) */}
              <Input
                label="💰 Monto Pagado"
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

              {/* Método de Pago (editable) */}
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

              {/* Fecha de Pago (editable) */}
              <Input
                label="📅 Fecha de Pago"
                name="paymentDate"
                type="datetime-local"
                value={formData.paymentDate}
                onChange={handleChange}
              />

              {/* ID de Transacción (editable) */}
              <Input
                label="🏷️ ID de Transacción"
                name="transactionId"
                type="text"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="CASH-001, VISA-1234, etc."
              />

              {/* Estado (editable) */}
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