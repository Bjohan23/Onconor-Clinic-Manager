const { DataTypes } = require("sequelize");
const { getSequelize } =  require('../../shared/config/db');

const defineUser = (sequelize) => {
    return sequelize.define(
        "users",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            establishment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            person_num_doc: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            flg_deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: 1
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
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const User = () => {
    const sequelize = getSequelize();
    if (!sequelize.models.users) {
        defineUser(sequelize);
    }
    return sequelize.models.users;
};

module.exports = User;