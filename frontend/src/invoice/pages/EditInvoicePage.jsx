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
    amount: '',
    tax: '',
    total: '',
    status: '',
    issueDate: '',
    dueDate: '',
  });

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoadingInvoice(true);
      const response = await invoiceService.getById(id);
      if (response.success) {
        const data = response.data?.invoice;
        setInvoice(data);
        setFormData({
          amount: data.amount || '',
          tax: data.tax || '',
          total: data.total || '',
          status: data.status || '',
          issueDate: data.issueDate ? data.issueDate.slice(0, 16) : '', // Formato datetime-local
          dueDate: data.dueDate ? data.dueDate.slice(0, 16) : '', // Formato datetime-local
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
      // El API devuelve { success: true, data: { invoice: {...} } }
      if (response.success && response.data?.invoice) {
        toast.success('Factura actualizada exitosamente');
        navigate('/invoices');
      } else {
        setErrors({ submit: response.message || 'Error al actualizar la factura' });
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
      setErrors({ submit: err?.message || 'Error de conexión. Inténtalo nuevamente.' });
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
                <h3 className="font-medium" style={{ color: colors.error?.[700] || '#b91c1c' }}>
                  Error al actualizar factura
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
            <CardTitle>Información de la Factura</CardTitle>
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
                    {invoice?.patient?.fullName || `Paciente #${invoice?.patientId}`}
                  </div>
                  {invoice?.patient?.dni && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      DNI: {invoice.patient.dni}
                    </div>
                  )}
                  {invoice?.patient?.phone && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Teléfono: {invoice.patient.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la cita (solo lectura) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  📅 Cita Médica
                </label>
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.light 
                }}>
                  <div className="font-semibold" style={{ color: colors.text.primary }}>
                    Cita #{invoice?.appointmentId}
                  </div>
                  {invoice?.appointment?.appointmentDate && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Fecha: {new Date(invoice.appointment.appointmentDate).toLocaleDateString('es-ES')}
                    </div>
                  )}
                  {invoice?.appointment?.doctor?.fullName && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Dr. {invoice.appointment.doctor.fullName}
                    </div>
                  )}
                  {invoice?.appointment?.doctor?.specialty?.name && (
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      {invoice.appointment.doctor.specialty.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Monto base (editable) */}
              <Input
                label="💰 Monto Base"
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

              {/* IGV (editable) */}
              <Input
                label="🏦 IGV"
                name="tax"
                type="number"
                step="0.01"
                min="0"
                value={formData.tax}
                onChange={handleChange}
                placeholder="0.00"
              />

              {/* Total (editable) */}
              <Input
                label="🧾 Total"
                name="total"
                type="number"
                step="0.01"
                min="0"
                value={formData.total}
                onChange={handleChange}
                placeholder="0.00"
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
                  <option value="paid">Pagado</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                {errors.status && (
                  <p className="text-sm mt-1" style={{ color: colors.error?.[600] || '#dc2626' }}>
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Fecha de emisión (editable) */}
              <Input
                label="📅 Fecha de Emisión"
                name="issueDate"
                type="datetime-local"
                value={formData.issueDate}
                onChange={handleChange}
              />

              {/* Fecha de vencimiento (editable) */}
              <Input
                label="⏰ Fecha de Vencimiento"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
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