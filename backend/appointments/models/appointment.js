const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const defineAppointment = () => {
    return sequelize.define(
        "appointments",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            patientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'patient_id',
                references: {
                    model: 'patients',
                    key: 'id'
                }
            },
            doctorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'doctor_id',
                references: {
                    model: 'doctors',
                    key: 'id'
                }
            },
            appointmentDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'appointment_date'
            },
            appointmentTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'appointment_time'
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Reason for the appointment'
            },
            status: {
                type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
                allowNull: false,
                defaultValue: 'scheduled',
                comment: 'Status of the appointment'
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Additional notes for the appointment'
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            flg_deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            user_created: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_updated: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_deleted: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            tableName: "appointments",
            indexes: [
                {
                    fields: ['patient_id']
                },
                {
                    fields: ['doctor_id']
                },
                {
                    fields: ['appointment_date']
                },
                {
                    fields: ['status']
                },
                {
                    fields: ['active']
                },
                {
                    unique: true,
                    fields: ['doctor_id', 'appointment_date', 'appointment_time'],
                    name: 'unique_doctor_datetime'
                }
            ]
        }
    );
};

const Appointment = () => {
    if (!sequelize.models.appointments) {
        defineAppointment();
    }
    return sequelize.models.appointments;
};

module.exports = Appointment;