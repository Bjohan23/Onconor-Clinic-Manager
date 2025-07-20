const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const defineAppointmentStatus = () => {
    return sequelize.define(
        "appointment_statuses",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            color: {
                type: DataTypes.STRING(7),
                allowNull: false,
                defaultValue: '#3B82F6',
                validate: {
                    is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                },
                comment: 'Hex color code for UI display'
            },
            category: {
                type: DataTypes.ENUM('active', 'completed', 'cancelled', 'pending'),
                allowNull: false,
                defaultValue: 'active'
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_default'
            },
            allowBooking: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'allow_booking',
                comment: 'Whether new appointments can be booked with this status'
            },
            allowCancellation: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'allow_cancellation',
                comment: 'Whether appointments with this status can be cancelled'
            },
            allowRescheduling: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'allow_rescheduling',
                comment: 'Whether appointments with this status can be rescheduled'
            },
            notifyPatient: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'notify_patient',
                comment: 'Whether to send notifications when status changes to this'
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'sort_order',
                comment: 'Order for displaying in UI'
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
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
            tableName: "appointment_statuses",
            indexes: [
                {
                    unique: true,
                    fields: ['name']
                },
                {
                    fields: ['category']
                },
                {
                    fields: ['is_active']
                },
                {
                    fields: ['sort_order']
                }
            ]
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const AppointmentStatus = () => {
    if (!sequelize.models.appointment_statuses) {
        defineAppointmentStatus();
    }
    return sequelize.models.appointment_statuses;
};

module.exports = AppointmentStatus;