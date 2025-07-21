import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { doctorService } from '../services/doctorService';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

const DoctorSchedulePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await doctorService.getDoctorSchedules(id);
        if (response.success) {
          setSchedules(response.data?.schedules || []);
        } else {
          setError(response.message || 'No se pudieron cargar los horarios');
        }
      } catch (err) {
        setError('Error de conexión al cargar los horarios');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent neon-text">
            Horarios del Doctor
          </h1>
          <p className="text-base opacity-80 mt-1" style={{ color: colors.text.secondary }}>
            Gestión de horarios para el doctor seleccionado
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/doctors')}>
          Volver a Doctores
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Horarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-48">
              <LoadingSpinner size="lg" text="Cargando horarios..." center />
            </div>
          ) : error ? (
            <div className="text-center text-red-400 font-medium py-8">{error}</div>
          ) : schedules.length === 0 ? (
            <div className="text-center text-white/70 py-8">No hay horarios registrados para este doctor.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-800/30">
                <thead>
                  <tr className="bg-blue-900/30">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300">Día</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300">Hora Inicio</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300">Hora Fin</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300">Consultorio</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-900/10 divide-y divide-blue-800/20">
                  {schedules.map((sch, idx) => (
                    <tr key={sch.id || idx}>
                      <td className="px-4 py-2 text-white/90">{sch.day || '-'}</td>
                      <td className="px-4 py-2 text-white/80">{sch.startTime || '-'}</td>
                      <td className="px-4 py-2 text-white/80">{sch.endTime || '-'}</td>
                      <td className="px-4 py-2 text-white/80">{sch.office || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSchedulePage; 