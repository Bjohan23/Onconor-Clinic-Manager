const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const defineSchedule = () => {
    return sequelize.define(
        "schedules",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            dayOfWeek: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'day_of_week',
                validate: {
                    min: 0,
                    max: 6
                },
                comment: '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday'
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'start_time'
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'end_time'
            },
            isAvailable: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_available'
            },
            breakStart: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'break_start'
            },
            breakEnd: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'break_end'
            },
            slotDuration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 30,
                field: 'slot_duration',
                comment: 'Duration of each appointment slot in minutes'
            },
            maxPatientsPerSlot: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                field: 'max_patients_per_slot'
            },
            scheduleType: {
                type: DataTypes.ENUM('regular', 'special', 'emergency', 'surgery'),
                allowNull: false,
                defaultValue: 'regular',
                field: 'schedule_type'
            },
            validFrom: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'valid_from'
            },
            validTo: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'valid_to'
            },
            isRecurring: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_recurring'
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            tableName: "schedules",
            indexes: [
                {
                    fields: ['doctor_id']
                },
                {
                    fields: ['day_of_week']
                },
                {
                    fields: ['doctor_id', 'day_of_week']
                },
                {
                    fields: ['is_available']
                },
                {
                    fields: ['valid_from', 'valid_to']
                }
            ]
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const Schedule = () => {
    if (!sequelize.models.schedules) {
        defineSchedule();
    }
    return sequelize.models.schedules;
};

module.exports = Schedule;