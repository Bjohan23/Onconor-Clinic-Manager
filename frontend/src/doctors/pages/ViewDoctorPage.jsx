import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { doctorService } from '../services/doctorService';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

const ViewDoctorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await doctorService.getDoctorById(id);
        if (response.success) {
          setDoctor(response.data?.doctor);
        } else {
          setError(response.message || 'No se pudo cargar el doctor');
        }
      } catch (err) {
        setError('Error de conexión al cargar el doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-96"><LoadingSpinner size="lg" text="Cargando doctor..." center /></div>;
  }

  if (error || !doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Doctor no encontrado
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
          {error || 'El doctor solicitado no existe o no tienes permisos para verlo.'}
        </p>
        <Button onClick={() => navigate('/doctors')} className="mt-4">
          Volver a Doctores
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent neon-text">
            Detalle del Doctor
          </h1>
          <p className="text-base opacity-80 mt-1" style={{ color: colors.text.secondary }}>
            Información completa de <span className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</span>
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/doctors')}>
          Volver a Doctores
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información Personal */}
        <div className="glass rounded-2xl p-6 card-hover shadow-lg border border-blue-900/20">
          <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-blue-800 pb-2">Información Personal</h2>
          <div className="space-y-2 text-white/80">
            <div><span className="font-semibold text-blue-300">Código Médico:</span> {doctor.medicalCode}</div>
            <div><span className="font-semibold text-blue-300">Email:</span> {doctor.email}</div>
            <div><span className="font-semibold text-blue-300">Teléfono:</span> {doctor.phone}</div>
            <div><span className="font-semibold text-blue-300">Dirección:</span> {doctor.address || '-'}</div>
            <div><span className="font-semibold text-blue-300">Estado:</span> <span className="px-2 py-1 rounded-full bg-green-900/40 text-green-300 text-xs font-bold uppercase">{doctor.status || 'Activo'}</span></div>
          </div>
        </div>
        {/* Información Profesional */}
        <div className="glass rounded-2xl p-6 card-hover shadow-lg border border-purple-900/20">
          <h2 className="text-xl font-semibold mb-4 text-purple-400 border-b border-purple-800 pb-2">Información Profesional</h2>
          <div className="space-y-2 text-white/80">
            <div><span className="font-semibold text-purple-300">Especialidad:</span> {doctor.specialties && doctor.specialties.length > 0 ? doctor.specialties.map(s => s.name).join(', ') : doctor.specialty?.name || 'Sin especialidad'}</div>
            <div><span className="font-semibold text-purple-300">Número de Colegiatura:</span> {doctor.medicalLicense || doctor.licenseNumber || '-'}</div>
            <div><span className="font-semibold text-purple-300">Universidad:</span> {doctor.university}</div>
            <div><span className="font-semibold text-purple-300">Año de Graduación:</span> {doctor.graduationYear}</div>
            <div><span className="font-semibold text-purple-300">Años de Experiencia:</span> {doctor.experience}</div>
            <div><span className="font-semibold text-purple-300">Tarifa de Consulta:</span> <span className="text-green-400">S/ {doctor.consultationFee}</span></div>
          </div>
          {doctor.bio && (
            <div className="mt-4">
              <span className="font-semibold text-purple-300">Biografía:</span>
              <div className="text-sm mt-1 text-white/70">{doctor.bio}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDoctorPage; 