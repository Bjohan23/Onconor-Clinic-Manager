class AppointmentDto {
    constructor(appointment) {
        this.id = appointment.id;
        this.patientId = appointment.patientId;
        this.doctorId = appointment.doctorId;
        this.appointmentDate = appointment.appointmentDate;
        this.appointmentTime = appointment.appointmentTime;
        this.reason = appointment.reason;
        this.status = appointment.status;
        this.notes = appointment.notes;
        this.estimatedDuration = appointment.estimatedDuration;
        this.priority = appointment.priority;
        this.active = appointment.active;
        this.createdAt = appointment.created_at || appointment.createdAt;
        this.updatedAt = appointment.updated_at || appointment.updatedAt;
        
        // Campos calculados
        this.statusDisplay = this.getStatusDisplay(appointment.status);
        this.priorityDisplay = this.getPriorityDisplay(appointment.priority);
        this.appointmentDateTime = this.combineDateTime(appointment.appointmentDate, appointment.appointmentTime);
        
        // Información del paciente si está disponible
        if (appointment.patient) {
            this.patient = {
                id: appointment.patient.id,
                dni: appointment.patient.dni,
                fullName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                phone: appointment.patient.phone,
                email: appointment.patient.user?.email
            };
            this.patientName = this.patient.fullName;
        }
        
        // Información del médico si está disponible
        if (appointment.doctor) {
            this.doctor = {
                id: appointment.doctor.id,
                medicalLicense: appointment.doctor.medicalLicense,
                fullName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                phone: appointment.doctor.phone,
                specialtyName: appointment.doctor.specialty ? appointment.doctor.specialty.name : 'Sin especialidad'
            };
            this.doctorName = this.doctor.fullName;
            this.specialtyName = this.doctor.specialtyName;
        }
    }

    getStatusDisplay(status) {
        const statusMap = {
            'scheduled': 'Programada',
            'confirmed': 'Confirmada', 
            'in_progress': 'En Progreso',
            'completed': 'Completada',
            'cancelled': 'Cancelada',
            'no_show': 'No Asistió'
        };
        return statusMap[status] || status;
    }

    getPriorityDisplay(priority) {
        const priorityMap = {
            'low': 'Baja',
            'normal': 'Normal',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorityMap[priority] || priority;
    }

    combineDateTime(date, time) {
        if (!date || !time) return null;
        return new Date(`${date}T${time}`);
    }

    // DTO para crear cita (solo campos necesarios)
    static forCreate(data) {
        return {
            patientId: data.patientId,
            doctorId: data.doctorId,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime,
            reason: data.reason,
            estimatedDuration: data.estimatedDuration || 30,
            priority: data.priority || 'normal',
            notes: data.notes || null
        };
    }

    // DTO para actualizar cita (solo campos permitidos)
    static forUpdate(data) {
        const updateData = {};
        
        if (data.appointmentDate !== undefined) updateData.appointmentDate = data.appointmentDate;
        if (data.appointmentTime !== undefined) updateData.appointmentTime = data.appointmentTime;
        if (data.reason !== undefined) updateData.reason = data.reason;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.status !== undefined) updateData.status = data.status;
        
        return updateData;
    }

    // DTO para listado simplificado
    static forList(appointment) {
        return {
            id: appointment.id,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            patientName: appointment.patient ? 
                `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Sin paciente',
            doctorName: appointment.doctor ? 
                `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Sin médico',
            specialtyName: appointment.doctor?.specialty?.name || 'Sin especialidad',
            status: appointment.status,
            statusDisplay: new AppointmentDto(appointment).getStatusDisplay(appointment.status),
            priority: appointment.priority,
            estimatedDuration: appointment.estimatedDuration
        };
    }

    // DTO para calendario
    static forCalendar(appointment) {
        const dto = new AppointmentDto(appointment);
        return {
            id: appointment.id,
            title: `${dto.patientName} - ${appointment.reason}`,
            start: dto.appointmentDateTime,
            end: dto.calculateEndTime(),
            backgroundColor: dto.getStatusColor(appointment.status),
            borderColor: dto.getPriorityColor(appointment.priority),
            patientName: dto.patientName,
            doctorName: dto.doctorName,
            status: appointment.status,
            priority: appointment.priority,
            reason: appointment.reason
        };
    }

    calculateEndTime() {
        if (!this.appointmentDateTime || !this.estimatedDuration) return null;
        const endTime = new Date(this.appointmentDateTime);
        endTime.setMinutes(endTime.getMinutes() + this.estimatedDuration);
        return endTime;
    }

    getStatusColor(status) {
        const colorMap = {
            'scheduled': '#6B7280',    // Gris
            'confirmed': '#3B82F6',    // Azul
            'in_progress': '#F59E0B',  // Amarillo
            'completed': '#10B981',    // Verde
            'cancelled': '#EF4444',    // Rojo
            'no_show': '#8B5CF6'       // Púrpura
        };
        return colorMap[status] || '#6B7280';
    }

    getPriorityColor(priority) {
        const colorMap = {
            'low': '#10B981',      // Verde
            'normal': '#6B7280',   // Gris
            'high': '#F59E0B',     // Amarillo
            'urgent': '#EF4444'    // Rojo
        };
        return colorMap[priority] || '#6B7280';
    }

    // DTO para reportes
    static forReport(appointment) {
        const dto = new AppointmentDto(appointment);
        return {
            basicInfo: {
                id: dto.id,
                appointmentDate: dto.appointmentDate,
                appointmentTime: dto.appointmentTime,
                reason: dto.reason,
                status: dto.status,
                statusDisplay: dto.statusDisplay,
                priority: dto.priority,
                priorityDisplay: dto.priorityDisplay,
                estimatedDuration: dto.estimatedDuration
            },
            patient: dto.patient,
            doctor: dto.doctor,
            systemInfo: {
                createdAt: dto.createdAt,
                updatedAt: dto.updatedAt,
                active: dto.active
            }
        };
    }

    // DTO para notificaciones
    static forNotification(appointment) {
        const dto = new AppointmentDto(appointment);
        return {
            id: appointment.id,
            patientName: dto.patientName,
            doctorName: dto.doctorName,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            reason: appointment.reason,
            patientPhone: dto.patient?.phone,
            patientEmail: dto.patient?.email,
            timeUntilAppointment: dto.calculateTimeUntil(),
            reminderType: dto.determineReminderType()
        };
    }

    calculateTimeUntil() {
        if (!this.appointmentDateTime) return null;
        
        const now = new Date();
        const diffMs = this.appointmentDateTime - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            hours,
            minutes,
            totalMinutes: Math.floor(diffMs / (1000 * 60)),
            isPast: diffMs < 0
        };
    }

    determineReminderType() {
        const timeUntil = this.calculateTimeUntil();
        if (!timeUntil || timeUntil.isPast) return null;
        
        if (timeUntil.totalMinutes <= 60) return '1_hour';
        if (timeUntil.totalMinutes <= 1440) return '24_hours';
        if (timeUntil.totalMinutes <= 4320) return '3_days';
        
        return null;
    }

    // DTO para dashboard/métricas
    static forDashboard(appointment) {
        return {
            id: appointment.id,
            status: appointment.status,
            priority: appointment.priority,
            appointmentDate: appointment.appointmentDate,
            patientName: appointment.patient ? 
                `${appointment.patient.firstName} ${appointment.patient.lastName}` : null,
            doctorName: appointment.doctor ? 
                `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : null,
            isToday: appointment.appointmentDate === new Date().toISOString().split('T')[0],
            isUpcoming: new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`) > new Date()
        };
    }

    // DTO para respuesta completa
    toResponse() {
        return {
            id: this.id,
            patientId: this.patientId,
            doctorId: this.doctorId,
            appointmentDate: this.appointmentDate,
            appointmentTime: this.appointmentTime,
            appointmentDateTime: this.appointmentDateTime,
            reason: this.reason,
            status: this.status,
            statusDisplay: this.statusDisplay,
            notes: this.notes,
            estimatedDuration: this.estimatedDuration,
            priority: this.priority,
            priorityDisplay: this.priorityDisplay,
            active: this.active,
            patient: this.patient,
            doctor: this.doctor,
            patientName: this.patientName,
            doctorName: this.doctorName,
            specialtyName: this.specialtyName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = AppointmentDto;