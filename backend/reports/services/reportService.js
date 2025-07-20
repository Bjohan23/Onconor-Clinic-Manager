const { Sequelize, Op } = require('sequelize');
const db = require('../../shared/models/index');

const reportService = {
    // Estadísticas generales del dashboard
    async getDashboardStats() {
        try {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

            // Estadísticas básicas
            const [
                totalPatients,
                totalDoctors,
                totalAppointmentsThisMonth,
                totalRevenueThisMonth,
                pendingAppointments,
                completedAppointmentsThisMonth
            ] = await Promise.all([
                db.Patient.count({ where: { isActive: true } }),
                db.Doctor.count({ where: { isActive: true } }),
                db.Appointment.count({
                    where: {
                        appointmentDate: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }),
                db.Payment.sum('amount', {
                    where: {
                        paymentDate: {
                            [Op.gte]: firstDayOfMonth
                        },
                        status: 'completed'
                    }
                }) || 0,
                db.Appointment.count({
                    where: {
                        status: 'scheduled'
                    }
                }),
                db.Appointment.count({
                    where: {
                        status: 'completed',
                        appointmentDate: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                })
            ]);

            // Tendencias (comparación con mes anterior)
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const [
                appointmentsLastMonth,
                revenueLastMonth
            ] = await Promise.all([
                db.Appointment.count({
                    where: {
                        appointmentDate: {
                            [Op.gte]: lastMonth,
                            [Op.lt]: firstDayOfMonth
                        }
                    }
                }),
                db.Payment.sum('amount', {
                    where: {
                        paymentDate: {
                            [Op.gte]: lastMonth,
                            [Op.lt]: firstDayOfMonth
                        },
                        status: 'completed'
                    }
                }) || 0
            ]);

            const appointmentsTrend = appointmentsLastMonth > 0 
                ? ((totalAppointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth * 100).toFixed(1)
                : 0;

            const revenueTrend = revenueLastMonth > 0 
                ? ((totalRevenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
                : 0;

            return {
                totalPatients,
                totalDoctors,
                totalAppointmentsThisMonth,
                totalRevenueThisMonth,
                pendingAppointments,
                completedAppointmentsThisMonth,
                trends: {
                    appointments: appointmentsTrend,
                    revenue: revenueTrend
                }
            };
        } catch (error) {
            console.error('Error en getDashboardStats:', error);
            throw error;
        }
    },

    // Reporte de citas por período
    async getAppointmentsReport({ startDate, endDate, doctorId, specialtyId }) {
        try {
            const whereClause = {};
            
            if (startDate && endDate) {
                whereClause.appointmentDate = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            if (doctorId) {
                whereClause.doctorId = doctorId;
            }

            const includeOptions = [
                {
                    model: db.Patient,
                    attributes: ['firstName', 'lastName', 'email']
                },
                {
                    model: db.Doctor,
                    attributes: ['firstName', 'lastName'],
                    include: specialtyId ? [{
                        model: db.Specialty,
                        where: { id: specialtyId },
                        attributes: ['name']
                    }] : [{
                        model: db.Specialty,
                        attributes: ['name']
                    }]
                }
            ];

            const appointments = await db.Appointment.findAll({
                where: whereClause,
                include: includeOptions,
                order: [['appointmentDate', 'DESC']]
            });

            // Agrupar por estado
            const byStatus = appointments.reduce((acc, appointment) => {
                acc[appointment.status] = (acc[appointment.status] || 0) + 1;
                return acc;
            }, {});

            // Agrupar por médico
            const byDoctor = appointments.reduce((acc, appointment) => {
                const doctorName = `${appointment.Doctor.firstName} ${appointment.Doctor.lastName}`;
                acc[doctorName] = (acc[doctorName] || 0) + 1;
                return acc;
            }, {});

            return {
                total: appointments.length,
                appointments,
                summary: {
                    byStatus,
                    byDoctor
                }
            };
        } catch (error) {
            console.error('Error en getAppointmentsReport:', error);
            throw error;
        }
    },

    // Reporte de ingresos por período
    async getRevenueReport({ startDate, endDate, groupBy = 'month' }) {
        try {
            const whereClause = {
                status: 'completed'
            };

            if (startDate && endDate) {
                whereClause.paymentDate = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const payments = await db.Payment.findAll({
                where: whereClause,
                include: [{
                    model: db.Invoice,
                    include: [{
                        model: db.Patient,
                        attributes: ['firstName', 'lastName']
                    }]
                }],
                order: [['paymentDate', 'ASC']]
            });

            // Agrupar por período
            const groupedData = {};
            payments.forEach(payment => {
                const date = new Date(payment.paymentDate);
                let key;

                switch (groupBy) {
                    case 'day':
                        key = date.toISOString().split('T')[0];
                        break;
                    case 'week':
                        const week = Math.ceil(date.getDate() / 7);
                        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
                        break;
                    case 'month':
                        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                        break;
                    case 'year':
                        key = date.getFullYear().toString();
                        break;
                    default:
                        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                }

                if (!groupedData[key]) {
                    groupedData[key] = {
                        period: key,
                        total: 0,
                        count: 0,
                        payments: []
                    };
                }

                groupedData[key].total += parseFloat(payment.amount);
                groupedData[key].count += 1;
                groupedData[key].payments.push(payment);
            });

            const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

            return {
                totalRevenue,
                totalPayments: payments.length,
                groupedData: Object.values(groupedData),
                payments
            };
        } catch (error) {
            console.error('Error en getRevenueReport:', error);
            throw error;
        }
    },

    // Reporte de médicos por productividad
    async getDoctorsReport({ startDate, endDate }) {
        try {
            const whereClause = {};
            
            if (startDate && endDate) {
                whereClause.appointmentDate = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const doctors = await db.Doctor.findAll({
                where: { isActive: true },
                include: [
                    {
                        model: db.Specialty,
                        attributes: ['name']
                    },
                    {
                        model: db.Appointment,
                        where: whereClause,
                        required: false,
                        attributes: ['id', 'status', 'appointmentDate']
                    }
                ]
            });

            const doctorStats = doctors.map(doctor => {
                const appointments = doctor.Appointments || [];
                const completed = appointments.filter(apt => apt.status === 'completed').length;
                const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
                const pending = appointments.filter(apt => apt.status === 'scheduled').length;

                return {
                    id: doctor.id,
                    name: `${doctor.firstName} ${doctor.lastName}`,
                    specialty: doctor.Specialty?.name || 'Sin especialidad',
                    email: doctor.email,
                    phone: doctor.phone,
                    totalAppointments: appointments.length,
                    completedAppointments: completed,
                    cancelledAppointments: cancelled,
                    pendingAppointments: pending,
                    completionRate: appointments.length > 0 ? ((completed / appointments.length) * 100).toFixed(1) : 0
                };
            });

            return {
                doctors: doctorStats.sort((a, b) => b.totalAppointments - a.totalAppointments)
            };
        } catch (error) {
            console.error('Error en getDoctorsReport:', error);
            throw error;
        }
    },

    // Reporte de pacientes por período
    async getPatientsReport({ startDate, endDate }) {
        try {
            const whereClause = { isActive: true };
            
            if (startDate && endDate) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const patients = await db.Patient.findAll({
                where: whereClause,
                include: [{
                    model: db.Appointment,
                    attributes: ['id', 'status', 'appointmentDate']
                }],
                order: [['createdAt', 'DESC']]
            });

            const patientsStats = patients.map(patient => {
                const appointments = patient.Appointments || [];
                return {
                    id: patient.id,
                    name: `${patient.firstName} ${patient.lastName}`,
                    email: patient.email,
                    phone: patient.phone,
                    age: patient.age,
                    registrationDate: patient.createdAt,
                    totalAppointments: appointments.length,
                    lastAppointment: appointments.length > 0 
                        ? Math.max(...appointments.map(apt => new Date(apt.appointmentDate)))
                        : null
                };
            });

            return {
                totalPatients: patients.length,
                patients: patientsStats
            };
        } catch (error) {
            console.error('Error en getPatientsReport:', error);
            throw error;
        }
    },

    // Reporte de especialidades más solicitadas
    async getSpecialtiesReport({ startDate, endDate }) {
        try {
            const whereClause = {};
            
            if (startDate && endDate) {
                whereClause.appointmentDate = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const specialties = await db.Specialty.findAll({
                where: { isActive: true },
                include: [{
                    model: db.Doctor,
                    include: [{
                        model: db.Appointment,
                        where: whereClause,
                        required: false
                    }]
                }]
            });

            const specialtyStats = specialties.map(specialty => {
                const appointments = specialty.Doctors.reduce((acc, doctor) => {
                    return acc.concat(doctor.Appointments || []);
                }, []);

                return {
                    id: specialty.id,
                    name: specialty.name,
                    description: specialty.description,
                    totalDoctors: specialty.Doctors.length,
                    totalAppointments: appointments.length,
                    appointmentsByStatus: appointments.reduce((acc, apt) => {
                        acc[apt.status] = (acc[apt.status] || 0) + 1;
                        return acc;
                    }, {})
                };
            });

            return {
                specialties: specialtyStats.sort((a, b) => b.totalAppointments - a.totalAppointments)
            };
        } catch (error) {
            console.error('Error en getSpecialtiesReport:', error);
            throw error;
        }
    },

    // Exportar a PDF (funcionalidad básica)
    async exportToPDF(reportType, filters) {
        // Aquí implementarías la lógica de exportación a PDF
        // Podrías usar librerías como puppeteer, jsPDF, etc.
        throw new Error('Exportación a PDF no implementada aún');
    },

    // Exportar a Excel (funcionalidad básica)
    async exportToExcel(reportType, filters) {
        // Aquí implementarías la lógica de exportación a Excel
        // Podrías usar librerías como exceljs, xlsx, etc.
        throw new Error('Exportación a Excel no implementada aún');
    }
};

module.exports = reportService;