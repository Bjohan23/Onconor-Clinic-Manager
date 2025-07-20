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
                comment: 'Status name'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Description of the status'
            },
            color: {
                type: DataTypes.STRING(7),
                allowNull: true,
                defaultValue: '#000000',
                comment: 'Color code for UI display (hex format)'
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
            tableName: "appointment_statuses",
            indexes: [
                {
                    unique: true,
                    fields: ['name']
                },
                {
                    fields: ['active']
                }
            ]
        }
    );
};

const AppointmentStatus = () => {
    if (!sequelize.models.appointment_statuses) {
        defineAppointmentStatus();
    }
    return sequelize.models.appointment_statuses;
};

module.exports = AppointmentStatus;