// Servicio de exportación para datos a CSV y JSON
export const exportService = {
    // Exportar datos a CSV
    exportToCSV: (data, filename = 'export') => {
        try {
            if (!data || data.length === 0) {
                throw new Error('No hay datos para exportar');
            }

            // Obtener las claves del primer objeto para el header
            const headers = Object.keys(data[0]);
            
            // Crear el contenido CSV
            const csvContent = [
                // Header
                headers.join(','),
                // Datos
                ...data.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        // Escapar valores que contienen comas o comillas
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value || '';
                    }).join(',')
                )
            ].join('\n');

            // Crear y descargar el archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error al exportar a CSV:', error);
            throw error;
        }
    },

    // Exportar datos a JSON
    exportToJSON: (data, filename = 'export') => {
        try {
            if (!data) {
                throw new Error('No hay datos para exportar');
            }

            const jsonContent = JSON.stringify(data, null, 2);
            
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.json`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error al exportar a JSON:', error);
            throw error;
        }
    },

    // Exportar tabla HTML a Excel (usando CSV)
    exportTableToExcel: (tableData, filename = 'export') => {
        try {
            // Usar el método CSV ya que Excel puede abrir archivos CSV
            return exportService.exportToCSV(tableData, filename);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw error;
        }
    },

    // Preparar datos de pacientes para exportación
    preparePatientData: (patients) => {
        return patients.map(patient => ({
            'ID': patient.id,
            'Nombre': patient.firstName,
            'Apellido': patient.lastName,
            'Email': patient.email,
            'Teléfono': patient.phone,
            'Edad': patient.age,
            'Género': patient.gender,
            'Dirección': patient.address,
            'Fecha de Registro': new Date(patient.createdAt).toLocaleDateString(),
            'Estado': patient.isActive ? 'Activo' : 'Inactivo'
        }));
    },

    // Preparar datos de doctores para exportación
    prepareDoctorData: (doctors) => {
        return doctors.map(doctor => ({
            'ID': doctor.id,
            'Nombre': doctor.firstName,
            'Apellido': doctor.lastName,
            'Email': doctor.email,
            'Teléfono': doctor.phone,
            'Especialidad': doctor.Specialty?.name || 'Sin especialidad',
            'Licencia': doctor.licenseNumber,
            'Años de Experiencia': doctor.yearsOfExperience,
            'Fecha de Registro': new Date(doctor.createdAt).toLocaleDateString(),
            'Estado': doctor.isActive ? 'Activo' : 'Inactivo'
        }));
    },

    // Preparar datos de citas para exportación
    prepareAppointmentData: (appointments) => {
        return appointments.map(appointment => ({
            'ID': appointment.id,
            'Paciente': appointment.Patient ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}` : 'N/A',
            'Doctor': appointment.Doctor ? `${appointment.Doctor.firstName} ${appointment.Doctor.lastName}` : 'N/A',
            'Especialidad': appointment.Doctor?.Specialty?.name || 'N/A',
            'Fecha': new Date(appointment.appointmentDate).toLocaleDateString(),
            'Hora': new Date(appointment.appointmentDate).toLocaleTimeString(),
            'Estado': appointment.status,
            'Motivo': appointment.reason || 'N/A',
            'Notas': appointment.notes || 'N/A',
            'Fecha de Creación': new Date(appointment.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de horarios para exportación
    prepareScheduleData: (schedules) => {
        const getDayName = (dayOfWeek) => {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return days[dayOfWeek] || '';
        };

        return schedules.map(schedule => ({
            'ID': schedule.id,
            'Doctor': schedule.Doctor ? `${schedule.Doctor.firstName} ${schedule.Doctor.lastName}` : 'N/A',
            'Día de la Semana': getDayName(schedule.dayOfWeek),
            'Hora Inicio': schedule.startTime,
            'Hora Fin': schedule.endTime,
            'Descanso Inicio': schedule.breakStart || 'N/A',
            'Descanso Fin': schedule.breakEnd || 'N/A',
            'Disponible': schedule.isAvailable ? 'Sí' : 'No',
            'Activo': schedule.active ? 'Sí' : 'No',
            'Fecha de Creación': new Date(schedule.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de especialidades para exportación
    prepareSpecialtyData: (specialties) => {
        return specialties.map(specialty => ({
            'ID': specialty.id,
            'Nombre': specialty.name,
            'Descripción': specialty.description || 'N/A',
            'Estado': specialty.isActive ? 'Activo' : 'Inactivo',
            'Fecha de Creación': new Date(specialty.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de historiales médicos para exportación
    prepareMedicalRecordData: (records) => {
        return records.map(record => ({
            'ID': record.id,
            'Paciente': record.Patient ? `${record.Patient.firstName} ${record.Patient.lastName}` : 'N/A',
            'Doctor': record.Doctor ? `${record.Doctor.firstName} ${record.Doctor.lastName}` : 'N/A',
            'Fecha': new Date(record.recordDate).toLocaleDateString(),
            'Diagnóstico': record.diagnosis || 'N/A',
            'Síntomas': record.symptoms || 'N/A',
            'Tratamiento': record.treatment || 'N/A',
            'Notas': record.notes || 'N/A',
            'Fecha de Creación': new Date(record.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de facturas para exportación
    prepareInvoiceData: (invoices) => {
        return invoices.map(invoice => ({
            'ID': invoice.id,
            'Número de Factura': invoice.invoiceNumber,
            'Paciente': invoice.Patient ? `${invoice.Patient.firstName} ${invoice.Patient.lastName}` : 'N/A',
            'Fecha de Emisión': new Date(invoice.issueDate).toLocaleDateString(),
            'Fecha de Vencimiento': new Date(invoice.dueDate).toLocaleDateString(),
            'Subtotal': `$${invoice.subtotal}`,
            'Impuestos': `$${invoice.taxes}`,
            'Total': `$${invoice.total}`,
            'Estado': invoice.status,
            'Fecha de Creación': new Date(invoice.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de pagos para exportación
    preparePaymentData: (payments) => {
        return payments.map(payment => ({
            'ID': payment.id,
            'Factura': payment.Invoice?.invoiceNumber || 'N/A',
            'Paciente': payment.Invoice?.Patient ? `${payment.Invoice.Patient.firstName} ${payment.Invoice.Patient.lastName}` : 'N/A',
            'Monto': `$${payment.amount}`,
            'Método de Pago': payment.paymentMethod,
            'Fecha de Pago': new Date(payment.paymentDate).toLocaleDateString(),
            'Estado': payment.status,
            'Referencia': payment.reference || 'N/A',
            'Fecha de Creación': new Date(payment.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de tratamientos para exportación
    prepareTreatmentData: (treatments) => {
        return treatments.map(treatment => ({
            'ID': treatment.id,
            'Historial Médico': treatment.medicalRecordId,
            'Paciente': treatment.MedicalRecord?.Patient ? `${treatment.MedicalRecord.Patient.firstName} ${treatment.MedicalRecord.Patient.lastName}` : 'N/A',
            'Doctor': treatment.MedicalRecord?.Doctor ? `${treatment.MedicalRecord.Doctor.firstName} ${treatment.MedicalRecord.Doctor.lastName}` : 'N/A',
            'Nombre del Tratamiento': treatment.treatmentName,
            'Descripción': treatment.description || 'N/A',
            'Fecha de Inicio': new Date(treatment.startDate).toLocaleDateString(),
            'Fecha de Fin': treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'En curso',
            'Estado': treatment.status,
            'Notas': treatment.notes || 'N/A',
            'Fecha de Creación': new Date(treatment.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de prescripciones para exportación
    preparePrescriptionData: (prescriptions) => {
        return prescriptions.map(prescription => ({
            'ID': prescription.id,
            'Historial Médico': prescription.medicalRecordId,
            'Paciente': prescription.MedicalRecord?.Patient ? `${prescription.MedicalRecord.Patient.firstName} ${prescription.MedicalRecord.Patient.lastName}` : 'N/A',
            'Doctor': prescription.MedicalRecord?.Doctor ? `${prescription.MedicalRecord.Doctor.firstName} ${prescription.MedicalRecord.Doctor.lastName}` : 'N/A',
            'Medicamento': prescription.medication,
            'Dosis': prescription.dosage,
            'Frecuencia': prescription.frequency,
            'Duración': prescription.duration,
            'Fecha de Prescripción': new Date(prescription.prescriptionDate).toLocaleDateString(),
            'Instrucciones': prescription.instructions || 'N/A',
            'Estado': prescription.status,
            'Fecha de Creación': new Date(prescription.createdAt).toLocaleDateString()
        }));
    },

    // Preparar datos de exámenes médicos para exportación
    prepareMedicalExamData: (exams) => {
        return exams.map(exam => ({
            'ID': exam.id,
            'Historial Médico': exam.medicalRecordId,
            'Paciente': exam.MedicalRecord?.Patient ? `${exam.MedicalRecord.Patient.firstName} ${exam.MedicalRecord.Patient.lastName}` : 'N/A',
            'Doctor': exam.MedicalRecord?.Doctor ? `${exam.MedicalRecord.Doctor.firstName} ${exam.MedicalRecord.Doctor.lastName}` : 'N/A',
            'Tipo de Examen': exam.examType,
            'Descripción': exam.description || 'N/A',
            'Fecha del Examen': new Date(exam.examDate).toLocaleDateString(),
            'Resultados': exam.results || 'Pendiente',
            'Estado': exam.status,
            'Notas': exam.notes || 'N/A',
            'Fecha de Creación': new Date(exam.createdAt).toLocaleDateString()
        }));
    },

    // Generar nombre de archivo con timestamp
    generateFilename: (baseName) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        return `${baseName}_${timestamp}`;
    }
};