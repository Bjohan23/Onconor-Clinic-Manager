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
                field: 'start_time',
                comment: 'Start time of availability'
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'end_time',
                comment: 'End time of availability'
            },
            isAvailable: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_available',
                comment: 'Whether the doctor is available during this time'
            },
            breakStart: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'break_start',
                comment: 'Start time of break/lunch'
            },
            breakEnd: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'break_end',
                comment: 'End time of break/lunch'
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
                    fields: ['is_available']
                },
                {
                    fields: ['active']
                },
                {
                    unique: true,
                    fields: ['doctor_id', 'day_of_week', 'start_time', 'end_time'],
                    name: 'unique_doctor_schedule'
                }
            ],
            validate: {
                endTimeAfterStartTime() {
                    if (this.startTime >= this.endTime) {
                        throw new Error('End time must be after start time');
                    }
                },
                breakTimesValid() {
                    if (this.breakStart && this.breakEnd) {
                        if (this.breakStart >= this.breakEnd) {
                            throw new Error('Break end time must be after break start time');
                        }
                        if (this.breakStart < this.startTime || this.breakEnd > this.endTime) {
                            throw new Error('Break times must be within working hours');
                        }
                    }
                }
            }
        }
    );
};

const Schedule = () => {
    if (!sequelize.models.schedules) {
        defineSchedule();
    }
    return sequelize.models.schedules;
};

module.exports = Schedule;