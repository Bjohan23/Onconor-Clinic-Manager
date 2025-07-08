const { DataTypes } = require('sequelize');
const { getSequelize } = require('../../shared/config/db');

const defineMilkIncome = (sequelize) => {
    const MilkIncome = sequelize.define('milk_income', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        supplier_route_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lot_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        arrival_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        total_volume: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        period: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        acidity: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            default: 0
        },
        somatic_cell_count: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        proteins: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        milk_fat: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        colony_forming_units: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        density: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        quality_test_step: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        is_mixed: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        milk_income_shift_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        flg_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        user_created: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'milk_income',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    MilkIncome.associate = (models) => {
        if (models.Suppliers) {
            MilkIncome.belongsTo(models.Suppliers, { foreignKey: 'supplier_route_id', as: 'supplier' });
        }
        if (models.MilkIncomeShift) {
            MilkIncome.belongsTo(models.MilkIncomeShift, { foreignKey: 'milk_income_shift_id', as: 'shift' });
        }
    };

    return MilkIncome;
};

const MilkIncome = () => {
    const sequelize = getSequelize();
    if (!sequelize.models.milk_income) {
        const MilkIncomeModel = defineMilkIncome(sequelize);
        const Suppliers = require('../../maintenance/suppliers/models/suppliers')();
        const MilkIncomeShift = require('../../maintenance/shifts/models/milkIncomeShifts')();
        MilkIncomeModel.associate({ Suppliers, MilkIncomeShift });
    }
    return sequelize.models.milk_income;
};

module.exports = MilkIncome;