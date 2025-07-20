const scheduleRepository = require('../repositories/scheduleRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const doctorRepository = require('../../doctors/repositories/doctorRepository');

class AvailabilityService {

    async checkDoctorAvailability(doctorId, date, startTime, endTime = null) {
        try {
            // Validar que el médico existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Obtener día de la semana (0 = Domingo, 1 = Lunes, etc.)
            const dayOfWeek = new Date(date).getDay();

            // Verificar si el médico tiene horario para ese día
            const schedules = await scheduleRepository.findByFilters({
                doctorId,
                dayOfWeek,
                isAvailable: true,
                active: true
            });

            if (schedules.length === 0) {
                return {
                    available: false,
                    reason: 'El médico no tiene horarios configurados para este día'
                };
            }

            // Verificar si la hora solicitada está dentro de algún horario
            const timeInSchedule = schedules.some(schedule => {
                const isInWorkingHours = startTime >= schedule.startTime && 
                                       (endTime ? endTime <= schedule.endTime : startTime < schedule.endTime);
                
                // Verificar que no esté en horario de descanso
                const isInBreakTime = schedule.breakStart && schedule.breakEnd &&
                                    startTime >= schedule.breakStart && startTime < schedule.breakEnd;

                return isInWorkingHours && !isInBreakTime;
            });

            if (!timeInSchedule) {
                return {
                    available: false,
                    reason: 'La hora solicitada está fuera del horario de atención o en periodo de descanso'
                };
            }

            // Verificar si ya existe una cita en ese horario
            const existingAppointments = await appointmentRepository.findByDateAndDoctor(doctorId, date);
            
            const hasConflict = existingAppointments.some(appointment => {
                const appointmentEnd = this.addMinutesToTime(appointment.appointmentTime, 30); // Asumimos 30 min por cita
                const requestedEnd = endTime || this.addMinutesToTime(startTime, 30);
                
                return this.timesOverlap(
                    startTime, 
                    requestedEnd,
                    appointment.appointmentTime, 
                    appointmentEnd
                );
            });

            if (hasConflict) {
                return {
                    available: false,
                    reason: 'Ya existe una cita programada en ese horario'
                };
            }

            return {
                available: true,
                reason: 'Horario disponible'
            };

        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }

    async getAvailableTimeSlots(doctorId, date, duration = 30) {
        try {
            const dayOfWeek = new Date(date).getDay();

            // Obtener horarios del médico para ese día
            const schedules = await scheduleRepository.findByFilters({
                doctorId,
                dayOfWeek,
                isAvailable: true,
                active: true
            });

            if (schedules.length === 0) {
                return [];
            }

            // Obtener citas existentes para ese día
            const existingAppointments = await appointmentRepository.findByDateAndDoctor(doctorId, date);
            
            const availableSlots = [];

            for (const schedule of schedules) {
                const slots = this.generateTimeSlots(
                    schedule.startTime,
                    schedule.endTime,
                    schedule.breakStart,
                    schedule.breakEnd,
                    duration
                );

                // Filtrar slots ocupados
                const freeSlots = slots.filter(slot => {
                    return !existingAppointments.some(appointment => {
                        const appointmentEnd = this.addMinutesToTime(appointment.appointmentTime, 30);
                        const slotEnd = this.addMinutesToTime(slot.startTime, duration);
                        
                        return this.timesOverlap(
                            slot.startTime,
                            slotEnd,
                            appointment.appointmentTime,
                            appointmentEnd
                        );
                    });
                });

                availableSlots.push(...freeSlots);
            }

            return availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        } catch (error) {
            throw new Error(`Error al obtener slots disponibles: ${error.message}`);
        }
    }

    async getWeeklyAvailability(doctorId, startDate, endDate) {
        try {
            const weeklyAvailability = [];
            const currentDate = new Date(startDate);
            const endDateObj = new Date(endDate);

            while (currentDate <= endDateObj) {
                const dateString = currentDate.toISOString().split('T')[0];
                const timeSlots = await this.getAvailableTimeSlots(doctorId, dateString);
                
                weeklyAvailability.push({
                    date: dateString,
                    dayOfWeek: currentDate.getDay(),
                    availableSlots: timeSlots,
                    totalSlots: timeSlots.length
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return weeklyAvailability;

        } catch (error) {
            throw new Error(`Error al obtener disponibilidad semanal: ${error.message}`);
        }
    }

    async getAvailabilityBySpecialty(specialtyId, date, startTime = null, endTime = null) {
        try {
            // Obtener médicos de la especialidad
            const doctors = await doctorRepository.findBySpecialty(specialtyId);
            
            if (doctors.length === 0) {
                return {
                    specialtyId,
                    availableDoctors: []
                };
            }

            const availableDoctors = [];

            for (const doctor of doctors) {
                if (startTime) {
                    const availability = await this.checkDoctorAvailability(
                        doctor.id, 
                        date, 
                        startTime, 
                        endTime
                    );
                    
                    if (availability.available) {
                        availableDoctors.push({
                            doctor: doctor,
                            availability: availability
                        });
                    }
                } else {
                    const timeSlots = await this.getAvailableTimeSlots(doctor.id, date);
                    
                    if (timeSlots.length > 0) {
                        availableDoctors.push({
                            doctor: doctor,
                            availableSlots: timeSlots
                        });
                    }
                }
            }

            return {
                specialtyId,
                date,
                availableDoctors
            };

        } catch (error) {
            throw new Error(`Error al obtener disponibilidad por especialidad: ${error.message}`);
        }
    }

    async getNextAvailableSlots(doctorId, limit = 10, duration = 30) {
        try {
            const nextSlots = [];
            const currentDate = new Date();
            const maxDaysAhead = 30; // Buscar hasta 30 días en el futuro
            
            let daysChecked = 0;

            while (nextSlots.length < limit && daysChecked < maxDaysAhead) {
                const dateString = currentDate.toISOString().split('T')[0];
                const timeSlots = await this.getAvailableTimeSlots(doctorId, dateString, duration);
                
                // Si es hoy, filtrar slots que ya pasaron
                if (daysChecked === 0) {
                    const currentTime = new Date().toTimeString().substring(0, 5);
                    const futureSlots = timeSlots.filter(slot => slot.startTime > currentTime);
                    nextSlots.push(...futureSlots.map(slot => ({
                        ...slot,
                        date: dateString
                    })));
                } else {
                    nextSlots.push(...timeSlots.map(slot => ({
                        ...slot,
                        date: dateString
                    })));
                }

                currentDate.setDate(currentDate.getDate() + 1);
                daysChecked++;
            }

            return nextSlots.slice(0, limit);

        } catch (error) {
            throw new Error(`Error al obtener próximos slots: ${error.message}`);
        }
    }

    async checkAppointmentConflicts(appointmentData) {
        try {
            const { doctorId, patientId, date, startTime, endTime } = appointmentData;

            const conflicts = [];

            // Verificar conflictos del médico
            const doctorAvailability = await this.checkDoctorAvailability(
                doctorId, 
                date, 
                startTime, 
                endTime
            );

            if (!doctorAvailability.available) {
                conflicts.push({
                    type: 'doctor_unavailable',
                    message: doctorAvailability.reason
                });
            }

            // Verificar si el paciente ya tiene una cita ese día
            const patientAppointments = await appointmentRepository.findByDateAndPatient(patientId, date);
            
            if (patientAppointments.length > 0) {
                conflicts.push({
                    type: 'patient_conflict',
                    message: 'El paciente ya tiene una cita programada para este día',
                    existingAppointments: patientAppointments
                });
            }

            return conflicts;

        } catch (error) {
            throw new Error(`Error al verificar conflictos: ${error.message}`);
        }
    }

    // Métodos auxiliares privados
    generateTimeSlots(startTime, endTime, breakStart, breakEnd, duration) {
        const slots = [];
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        const breakStartMin = breakStart ? this.timeToMinutes(breakStart) : null;
        const breakEndMin = breakEnd ? this.timeToMinutes(breakEnd) : null;

        let current = start;

        while (current + duration <= end) {
            const slotStart = this.minutesToTime(current);
            const slotEnd = this.minutesToTime(current + duration);

            // Verificar si el slot no está en el período de descanso
            const isInBreak = breakStartMin && breakEndMin &&
                            current < breakEndMin && (current + duration) > breakStartMin;

            if (!isInBreak) {
                slots.push({
                    startTime: slotStart,
                    endTime: slotEnd,
                    duration: duration
                });
            }

            current += duration;
        }

        return slots;
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    addMinutesToTime(timeString, minutes) {
        const totalMinutes = this.timeToMinutes(timeString) + minutes;
        return this.minutesToTime(totalMinutes);
    }

    timesOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }
}

module.exports = new AvailabilityService();